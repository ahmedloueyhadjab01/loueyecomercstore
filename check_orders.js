const { Client } = require('pg');
require('dotenv').config();

async function checkOrders() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  let res = await client.query('SELECT * FROM products WHERE is_active = 1');
  console.log('active products:', res.rows.map(r => ({id: r.id, user_id: r.user_id, is_active: r.is_active})));
  await client.end();
}
checkOrders();
