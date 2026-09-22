const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query('SELECT * FROM vendor_configs LIMIT 1');
  console.log('Configs columns:', Object.keys(res.rows[0] || {}));
  await client.end();
}
check();
