const { Client } = require('pg');
require('dotenv').config();

async function showSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'products';
  `);
  console.log(res.rows);
  const data = await client.query(`SELECT id, is_active FROM products LIMIT 5;`);
  console.log('Data:', data.rows);
  await client.end();
}
showSchema();
