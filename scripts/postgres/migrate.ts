import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Firebase credentials / Firestore export or Emulator credentials
const PG_CONFIG = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'aarizo_community',
  user: process.env.PG_USER || 'aarizo_admin',
  password: process.env.PG_PASSWORD || 'aarizo_secure_password_2026',
};

export async function runPostgresMigration() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client(PG_CONFIG);

  try {
    await client.connect();
    console.log(' Connected to PostgreSQL successfully!');

    const sqlDir = path.resolve(__dirname);
    const files = ['01_schema.sql', '02_rls_policies.sql', '03_seed.sql'];

    for (const file of files) {
      const filePath = path.join(sqlDir, file);
      if (fs.existsSync(filePath)) {
        console.log(` Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        await client.query(sql);
        console.log(` Successfully executed ${file}`);
      }
    }

    // Verify row counts
    const res = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM societies) as societies_count,
        (SELECT COUNT(*) FROM towers) as towers_count,
        (SELECT COUNT(*) FROM flats) as flats_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM residents) as residents_count,
        (SELECT COUNT(*) FROM visitor_passes) as passes_count,
        (SELECT COUNT(*) FROM billing_invoices) as invoices_count;
    `);

    console.log('\n--- PostgreSQL Verification Summary ---');
    console.table(res.rows);
    console.log('--- Migration Completed Successfully ---');
  } catch (error) {
    console.error(' Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Auto-run if executed directly
if (require.main === module) {
  runPostgresMigration();
}
