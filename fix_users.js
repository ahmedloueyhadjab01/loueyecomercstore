const { Client } = require('pg');
require('dotenv').config();

async function deleteExtraUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // The user said: "users: id=3 loueystore | id=4 kalkoul.dz"
    // So delete id=4? No wait, if I delete id=4, all products might be deleted if there is a CASCADE?
    // Let's just update products user_id to 3 before deleting!
    await client.query('UPDATE products SET user_id = 3 WHERE user_id = 4');
    await client.query('UPDATE categories SET user_id = 3 WHERE user_id = 4');
    await client.query('UPDATE orders SET user_id = 3 WHERE user_id = 4');
    
    // Delete user 4
    await client.query('DELETE FROM users WHERE id = 4');
    
    console.log('Successfully merged and deleted user 4');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

deleteExtraUsers();
