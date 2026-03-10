# Master Catalog Import Instructions

## Prerequisites

Before running the import, you need to obtain your Supabase Service Role Key.

### Getting the Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (Navneet Industries)
3. Click on **Settings** in the left sidebar
4. Click on **API**
5. Under "Project API keys", find the **service_role** key (NOT the anon key)
6. Click the eye icon to reveal the key
7. Copy the entire key

### Update .env File

Open the `.env` file in the root of the project and replace the `SUPABASE_SERVICE_ROLE_KEY` value with the actual key you copied.

The line should look like:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ACTUAL_KEY_HERE...
```

## Running the Import

### Step 1: Apply Database Migration (Add Unique Constraint)

First, we need to add a unique constraint to the products table. You can do this in two ways:

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Open the file `supabase/unique_constraint_migration.sql`
3. Copy and paste the entire SQL content into the SQL Editor
4. Click "Run" to execute

**Option B: Using Supabase CLI** (if installed)
```bash
supabase db push --file supabase/unique_constraint_migration.sql
```

### Step 2: Run the Import Script

Once you have the correct service role key in your `.env` file and the migration is applied:

```bash
node scripts/import_master_catalog.mjs
```

The script will:
- Parse the CSV file (1,156 products)
- Create/update clients as needed
- Insert products linked to their respective clients
- Show progress and statistics

Expected output:
```
🚀 Starting Master Catalog Import...
📖 Reading CSV from: H:\navneet-precision-web-2\Navneet_Master_Catalog_Clean.csv
✅ Parsed 1156 rows from CSV
👥 Found X unique clients
📦 Processing client 1/X: CLIENT_NAME...
...
✨ Import Complete!
📊 Statistics:
   Total Rows: 1156
   Clients Created: X
   Clients Updated: Y
   Products Created: Z
   Products Updated: W
✅ No errors!
```

## Verification

After the import completes, verify the data:

1. Check client count:
   ```sql
   SELECT COUNT(DISTINCT name) FROM clients;
   ```

2. Check product count:
   ```sql
   SELECT COUNT(*) FROM products WHERE client_id IS NOT NULL;
   ```

3. Spot check some products:
   ```sql
   SELECT c.name as client, p.name as product, p.unit_price 
   FROM products p 
   JOIN clients c ON c.id = p.client_id 
   ORDER BY c.name
   LIMIT 20;
   ```

## Testing the Application

After import:

1. Start the dev server: `npm run dev`
2. Navigate to the Dispatch interface
3. Select a client (should see newly imported clients)
4. Products should appear with correct unit prices
5. Create a test dispatch
6. Generate an invoice
7. Verify the invoice PDF shows correct rates (not ₹0.00)

## Troubleshooting

If you encounter errors:

1. **"Invalid API key"**: The service role key in `.env` is incorrect. Double-check you copied the service_role key (not anon key) from Supabase.

2. **Unique constraint violation**: The migration wasn't applied. Run the SQL migration first.

3. **CSV not found**: Make sure `Navneet_Master_Catalog_Clean.csv` is in the project root directory.

4. **Permission denied**: The service role key has full access, so this shouldn't happen. Check if RLS policies are interfering.
