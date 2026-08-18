-- Migration: Create Atomic RPC for Invoice Generation
-- Description: Adds a PL/pgSQL function to handle high-concurrency invoice generation atomically.

-- This function relies on the idempotency_keys and audit_trail tables created in the previous migration.

CREATE OR REPLACE FUNCTION create_invoice_atomic(
    p_idempotency_key VARCHAR,
    p_agent_id VARCHAR,
    p_client_id UUID,
    p_invoice_data JSONB,
    p_invoice_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_invoice_id UUID;
    v_item JSONB;
BEGIN
    -- 1. Idempotency Check
    -- If another request tries to use the same idempotency key, this will throw a unique constraint violation.
    -- We catch it below to gracefully ignore duplicate requests.
    INSERT INTO idempotency_keys (idempotency_key, agent_id, action)
    VALUES (p_idempotency_key, p_agent_id, 'create_invoice');

    -- 2. Insert the Invoice
    INSERT INTO invoices (
        invoice_number, 
        invoice_date, 
        client_id, 
        status, 
        subtotal, 
        total_amount, 
        cgst_amount, 
        sgst_amount, 
        igst_amount,
        created_at
    )
    VALUES (
        p_invoice_data->>'invoice_number',
        p_invoice_data->>'invoice_date',
        p_client_id,
        COALESCE(p_invoice_data->>'status', 'draft'),
        (p_invoice_data->>'subtotal')::NUMERIC,
        (p_invoice_data->>'total_amount')::NUMERIC,
        COALESCE((p_invoice_data->>'cgst_amount')::NUMERIC, 0),
        COALESCE((p_invoice_data->>'sgst_amount')::NUMERIC, 0),
        COALESCE((p_invoice_data->>'igst_amount')::NUMERIC, 0),
        NOW()
    )
    RETURNING id INTO v_invoice_id;

    -- 3. Insert the Invoice Items
    -- We loop through the JSONB array and insert each line item associated with the newly created invoice.
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_invoice_items)
    LOOP
        INSERT INTO invoice_items (
            invoice_id,
            product_id,
            description,
            quantity,
            rate,
            taxable_value,
            cgst_amount,
            sgst_amount,
            igst_amount,
            total
        )
        VALUES (
            v_invoice_id,
            (v_item->>'product_id')::UUID,
            v_item->>'description',
            (v_item->>'quantity')::NUMERIC,
            (v_item->>'rate')::NUMERIC,
            (v_item->>'taxable_value')::NUMERIC,
            COALESCE((v_item->>'cgst_amount')::NUMERIC, 0),
            COALESCE((v_item->>'sgst_amount')::NUMERIC, 0),
            COALESCE((v_item->>'igst_amount')::NUMERIC, 0),
            (v_item->>'total')::NUMERIC
        );
    END LOOP;

    -- 4. Create Audit Trail Entry
    -- Records the transaction securely within the same commit boundary.
    INSERT INTO audit_trail (entity_name, entity_id, action, performed_by)
    VALUES ('invoice', v_invoice_id, 'created_atomic', p_agent_id);

    -- 5. Return success response
    RETURN jsonb_build_object(
        'status', 'success',
        'invoice_id', v_invoice_id,
        'message', 'Invoice and items created atomically'
    );

EXCEPTION WHEN unique_violation THEN
    -- If the idempotency key already exists, catch the error and return gracefully.
    -- This guarantees a duplicate charge/invoice is NEVER processed.
    RETURN jsonb_build_object(
        'status', 'ignored',
        'message', 'Duplicate request identified and securely ignored'
    );
WHEN OTHERS THEN
    -- For any other errors, Postgres will automatically rollback the entire transaction.
    RAISE;
END;
$$;
