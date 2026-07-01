import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SKURegistry } from '@/lib/skuGenerator';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function MasterSync() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [status, setStatus] = useState<string>('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Handle simple CSV where quotes might exist
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const cleanRow = row.map(cell => cell.replace(/^"|"$/g, '').trim());
      const item: any = {};
      headers.forEach((h, idx) => {
        item[h] = cleanRow[idx];
      });
      data.push(item);
    }
    return data;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select a CSV file to upload.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setStatus('Parsing CSV...');
    
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      setProgress({ current: 0, total: rows.length });
      
      setStatus('Fetching existing SKUs...');
      const skuRegistry = new SKURegistry();
      const { data: existingProducts } = await supabase.from('products').select('sku');
      if (existingProducts) {
        existingProducts.forEach(p => p.sku && skuRegistry.registerExisting(p.sku));
      }

      setStatus('Processing rows...');
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const partyName = row['party name'] || row['party_name'] || row['partyname'];
        const description = row['description'];
        const rateText = row['rate'];
        const rate = parseFloat(rateText ? rateText.replace(/[^0-9.]/g, '') : '0');
        
        if (!partyName || !description) {
          setProgress(p => ({ ...p, current: i + 1 }));
          continue; // Skip invalid rows
        }

        // 1. Resolve Client
        let { data: client, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('name', partyName)
          .maybeSingle();

        if (!client) {
          const { data: newClient, error: newClientErr } = await supabase
            .from('clients')
            .insert({ name: partyName })
            .select('id')
            .single();
          if (newClientErr) throw newClientErr;
          client = newClient;
        }

        // 2. Resolve Product
        const sku = skuRegistry.generateUniqueSKU(description);
        let { data: product, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('sku', sku)
          .maybeSingle();

        if (!product) {
          const { data: newProduct, error: newProductErr } = await supabase
            .from('products')
            .insert({ sku, description, name: description, unit_price: rate }) 
            .select('id')
            .single();
          if (newProductErr) throw newProductErr;
          product = newProduct;
        }

        // 3. Upsert Client Pricing
        const { error: pricingError } = await supabase
          .from('client_pricing')
          .upsert(
            { client_id: client.id, product_id: product.id, custom_rate: rate || 0 },
            { onConflict: 'client_id,product_id' } // Note: ensure conflict target handles composite key
          );

        if (pricingError) throw pricingError;
        
        setProgress(p => ({ ...p, current: i + 1 }));
      }
      
      setStatus('Complete!');
      toast({ title: 'Success', description: `Processed ${rows.length} rows and synced the master catalog successfully!` });
    } catch (err: any) {
      console.error(err);
      setStatus('Error occurred');
      toast({ title: 'Sync Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseMigration = async () => {
    setLoading(true);
    setStatus('Fetching existing database products...');
    setProgress({ current: 0, total: 0 });

    try {
      // 1. Fetch all existing products
      const { data: existingProducts, error: fetchError } = await supabase
        .from('products')
        .select('*');

      if (fetchError) throw fetchError;
      if (!existingProducts || existingProducts.length === 0) {
        toast({ title: 'No Products Found', description: 'There are no products in the database to migrate.' });
        setLoading(false);
        return;
      }

      setProgress({ current: 0, total: existingProducts.length });
      setStatus('Migrating database records...');
      
      const skuRegistry = new SKURegistry();

      // First pass: register already-set SKUs so we don't overwrite them or conflict
      existingProducts.forEach(p => {
        if (p.sku) skuRegistry.registerExisting(p.sku);
      });

      for (let i = 0; i < existingProducts.length; i++) {
        const product = existingProducts[i];
        const descToUse = product.description || product.name || 'GEN';
        let sku = product.sku;

        // Generate SKU only if it's missing
        if (!sku) {
          sku = skuRegistry.generateUniqueSKU(descToUse);
          const { error: updateError } = await supabase
            .from('products')
            .update({ sku })
            .eq('id', product.id);
            
          if (updateError) throw updateError;
        }

        // Migrate pricing and client relationship to client_pricing
        if (product.client_id) {
          const { error: pricingError } = await supabase
            .from('client_pricing')
            .upsert(
              { client_id: product.client_id, product_id: product.id, custom_rate: product.unit_price || 0 },
              { onConflict: 'client_id,product_id' }
            );
            
          if (pricingError) throw pricingError;
        }

        setProgress(p => ({ ...p, current: i + 1 }));
      }

      setStatus('Complete!');
      toast({ title: 'Migration Success', description: `Successfully processed ${existingProducts.length} database products.` });
    } catch (err: any) {
      console.error(err);
      setStatus('Error occurred');
      toast({ title: 'Migration Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Catalog Sync</h1>
        <p className="text-muted-foreground mt-2">
          Upload your master CSV file containing Party Name, Description, and Rate. The system will automatically generate universal SKUs and update the pricing matrix.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Upload Master CSV
          </CardTitle>
          <CardDescription>
            The CSV file must have headers: "Party Name", "Description", "Rate".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              disabled={loading}
              className="max-w-sm"
            />
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {loading ? 'Syncing...' : 'Sync CSV Data'}
            </Button>
            <div className="text-muted-foreground">or</div>
            <Button variant="secondary" onClick={handleDatabaseMigration} disabled={loading}>
              <Database className="w-4 h-4 mr-2" />
              Migrate Existing Database
            </Button>
          </div>

          {loading && (
            <div className="space-y-2 bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{status}</span>
                <span className="text-muted-foreground">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {!loading && status === 'Complete!' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-4 rounded-md">
              <CheckCircle2 className="w-5 h-5" />
              <span>Sync completed successfully!</span>
            </div>
          )}
          
          <div className="bg-blue-500/10 p-4 rounded-md text-sm text-blue-800 dark:text-blue-200 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">SKU Generation Rules</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Prefix: CAP -&gt; PC, DISC/SEPARATOR -&gt; SD, BUSH -&gt; NB, WASHER -&gt; TW, Other -&gt; GEN</li>
                <li>Dimensions extracted: OD/ID/DIA/M followed by numbers</li>
                <li>Modifiers: UPPER -&gt; -UP, BOTTOM -&gt; -BT</li>
                <li>Conflicts resolved automatically with -V1, -V2 suffixes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
