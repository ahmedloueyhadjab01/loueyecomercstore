const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'products\'');
  console.log(res.rows.map(r => r.column_name));
  
  const sample = await client.query('SELECT images FROM products LIMIT 1');
  console.log('Sample images:', sample.rows[0]);
  await client.end();
}
check();
