-- RPC for Transactional Dispatch (Waterfall Allocation)
-- This function takes dispatch requests (product + qty), 
-- finds the oldest open POs (FIFO), allocates quantities, 
-- and creates an Invoice with Invoice Items in a single transaction.

create or replace function create_dispatch_invoice(
  p_client_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_receiver_details jsonb, -- {name, address, city, state, state_code, gstin}
  p_dispatch_items jsonb -- Array of {product_id, product_name, quantity, unit_price}
) returns jsonb as $$
declare
  v_invoice_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_remaining_qty numeric;
  v_po_line_record record;
  v_alloc_qty numeric;
  v_total_amount numeric := 0;
  v_subtotal numeric := 0;
  v_cgst numeric := 0;
  v_sgst numeric := 0;
  v_igst numeric := 0;
  
  -- Tax vars
  v_taxable_val numeric;
  v_line_cgst numeric;
  v_line_sgst numeric;
  v_line_igst numeric;
  v_line_total numeric;
  
  v_client_state_code text;
begin
  -- 1. Get Client State Code for Tax Logic
  select state_code into v_client_state_code from clients where id = p_client_id;
  
  -- 2. Insert Invoice Header 'Draft'
  insert into invoices (
    invoice_number, 
    invoice_date, 
    client_id,
    receiver_name, receiver_address, receiver_city, receiver_state, receiver_state_code, receiver_gstin,
    status
  ) values (
    p_invoice_number, 
    p_invoice_date, 
    p_client_id,
    p_receiver_details->>'name', p_receiver_details->>'address', p_receiver_details->>'city', p_receiver_details->>'state', p_receiver_details->>'state_code', p_receiver_details->>'gstin',
    'draft'
  ) returning id into v_invoice_id;
  
  -- 3. Loop through requested dispatch items
  for v_item in select * from jsonb_array_elements(p_dispatch_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_remaining_qty := (v_item->>'quantity')::numeric;
    
    -- Waterfall Logic: Find Open PO Line Items for this Product and Client, Ordered by PO Date (FIFO)
    -- We join purchase_orders to get the created_at date and client_id
    -- We calculate 'shipped' by summing existing invoice_items for that line item
    for v_po_line_record in 
      select 
        pli.id as line_id,
        pli.qty_ordered,
        coalesce(sum(ii.quantity), 0) as qty_shipped
      from po_line_items pli
      join purchase_orders po on po.id = pli.po_id
      left join invoice_items ii on ii.po_line_item_id = pli.id
      where po.client_id = p_client_id 
        and pli.product_id = v_product_id
        and po.status = 'open'
      group by pli.id, pli.qty_ordered, po.created_at
      having (pli.qty_ordered - coalesce(sum(ii.quantity), 0)) > 0
      order by po.created_at asc
    loop
      exit when v_remaining_qty <= 0;
      
      -- Calculate how much we can take from this PO Line
      v_alloc_qty := least(v_remaining_qty, v_po_line_record.qty_ordered - v_po_line_record.qty_shipped);
      
      if v_alloc_qty > 0 then
        -- Calculate Tax for this chunk
        v_taxable_val := v_alloc_qty * (v_item->>'unit_price')::numeric;
        
        -- Tax Rule: If state_code is '20' (Jharkhand), assume intra-state (CSGT+SGST). Else Inter-state (IGST).
        if v_client_state_code = '20' then 
           v_line_cgst := v_taxable_val * 0.09;
           v_line_sgst := v_taxable_val * 0.09;
           v_line_igst := 0;
        else
           v_line_cgst := 0;
           v_line_sgst := 0;
           v_line_igst := v_taxable_val * 0.18;
        end if;
        
        v_line_total := v_taxable_val + v_line_cgst + v_line_sgst + v_line_igst;
        
        -- Insert Invoice Item linked to PO Line
        insert into invoice_items (
          invoice_id, product_id, po_line_item_id,
          description, quantity, unit, rate,
          taxable_value, cgst_amount, sgst_amount, igst_amount, total
        ) values (
          v_invoice_id, 
          v_product_id,
          v_po_line_record.line_id,
          v_item->>'product_name',
          v_alloc_qty,
          'Nos',
          (v_item->>'unit_price')::numeric,
          v_taxable_val,
          v_line_cgst,
          v_line_sgst,
          v_line_igst,
          v_line_total
        );
        
        -- Update Running Totals
        v_subtotal := v_subtotal + v_taxable_val;
        v_cgst := v_cgst + v_line_cgst;
        v_sgst := v_sgst + v_line_sgst;
        v_igst := v_igst + v_line_igst;
        v_total_amount := v_total_amount + v_line_total;
        
        v_remaining_qty := v_remaining_qty - v_alloc_qty;
      end if;
    end loop;
    
    -- Verification: Did we satisfy the requested quantity?
    if v_remaining_qty > 0 then
       raise exception 'Insufficient PO quantity for product: %. Requested: %, Found: %', 
          (v_item->>'product_name'), 
          (v_item->>'quantity'), 
          ((v_item->>'quantity')::numeric - v_remaining_qty);
    end if;
  end loop;
  
  -- 4. Final Update of Invoice Totals
  update invoices set
    subtotal = v_subtotal,
    cgst_amount = v_cgst,
    sgst_amount = v_sgst,
    igst_amount = v_igst,
    total_amount = v_total_amount
    -- Status remains 'draft' until finalized? Or set to finalized? User didn't specify, leaving as draft.
  where id = v_invoice_id;
  
  return jsonb_build_object('id', v_invoice_id, 'invoice_number', p_invoice_number);
end;
$$ language plpgsql;
