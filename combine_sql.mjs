import fs from 'fs';
import path from 'path';

const sqlFiles = [
    'schema.sql',
    'product_groups_schema.sql',
    'unique_constraint_migration.sql',
    'master_schema_update.sql',
    'transaction_rpc.sql'
];

let combined = '';
for (const file of sqlFiles) {
    const content = fs.readFileSync(path.join('supabase', file), 'utf8');
    combined += `-- From ${file} \n\n` + content + '\n\n';
}

fs.writeFileSync(path.join('supabase', 'migrations', '20260706014329_baseline.sql'), combined);
console.log('Combined successfully.');
