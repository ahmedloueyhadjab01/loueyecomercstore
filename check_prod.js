const { Client } = require('pg');
require('dotenv').config();

async function checkProduct() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  let res = await client.query('SELECT has_variants FROM products WHERE id = 3');
  console.log('product 3:', res.rows);
  let v = await client.query('SELECT * FROM product_variants WHERE product_id = 3');
  console.log('variants:', v.rows);
  await client.end();
}
checkProduct();
