const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query('SELECT id, name FROM users WHERE role = $1', ['admin']);
  console.log('Admins:', res.rows);
  await client.end();
}
check();
