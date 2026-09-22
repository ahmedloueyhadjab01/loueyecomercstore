const { Client } = require('pg');
require('dotenv').config();

async function showDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    let res = await client.query('SELECT * FROM admins');
    console.log('admins:', res.rows);

    res = await client.query('SELECT * FROM users');
    console.log('users:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

showDb();
