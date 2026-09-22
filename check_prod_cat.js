const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query('SELECT category_id, (SELECT name FROM categories WHERE id=category_id) as category_name FROM products LIMIT 1');
  console.log(res.rows);
  await client.end();
}
check();
