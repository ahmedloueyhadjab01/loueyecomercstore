const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query('SELECT name, images FROM products WHERE user_id = 2 LIMIT 3');
  console.log(res.rows);
  await client.end();
}
check();
