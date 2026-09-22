const { Client } = require('pg');
require('dotenv').config();

async function deleteExtraAdmins() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // delete admin id=2
    await client.query('DELETE FROM admins WHERE id = 2');
    console.log('Successfully deleted admin 2');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

deleteExtraAdmins();
