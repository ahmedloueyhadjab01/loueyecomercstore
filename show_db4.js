const { Client } = require('pg');
require('dotenv').config();

async function showDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  let res = await client.query('SELECT id, name, role FROM users');
  console.log('users:', res.rows);
  res = await client.query('SELECT id, name, user_id, is_active FROM products');
  console.log('products:', res.rows);
  await client.end();
}
showDb();
