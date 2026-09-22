const { Client } = require('pg');
require('dotenv').config();

async function showDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const res = await client.query('SELECT id, user_id, name FROM products');
    console.log('products:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

showDb();
