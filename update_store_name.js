const { Client } = require('pg');
require('dotenv').config();

async function updateStoreName() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    await client.query("UPDATE users SET store_name = 'Kalkoul Store' WHERE id = 2");
    console.log('Updated store_name in DB for Kalkoul!');
  } catch (e) {
    console.log('DB Error:', e.message);
  }
  await client.end();
}
updateStoreName();
