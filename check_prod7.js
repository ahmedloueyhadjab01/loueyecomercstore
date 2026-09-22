const { Client } = require('pg');
require('dotenv').config();

async function checkProd7() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  let res = await client.query('SELECT * FROM products WHERE id = 7');
  console.log('product 7:', res.rows);
  await client.end();
}
checkProd7();
