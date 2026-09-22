const { Client } = require('pg');
require('dotenv').config();

async function cleanDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query('SELECT count(*) FROM products WHERE user_id = 2');
  console.log('Products in id=2:', res.rows[0].count);
  await client.end();
}
cleanDB();
