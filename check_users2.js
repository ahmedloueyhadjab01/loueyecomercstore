const { Client } = require('pg');
require('dotenv').config();

async function cleanDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  try {
      const users = await client.query('SELECT id, store_name, store_slug FROM users');
      console.log('Current users:', users.rows);
      
      const toDelete = users.rows.filter(u => u.id !== 2); // Wait, who is MAIN_STORE_USER_ID? The AI review says id=3 but the DB earlier showed user_id=2 had the categories.
      
  } catch (err) {
      console.error(err);
  } finally {
      await client.end();
  }
}
cleanDB();
