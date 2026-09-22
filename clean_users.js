const { Client } = require('pg');
require('dotenv').config();

async function cleanDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  try {
      // Check if user 4 exists
      const user = await client.query('SELECT * FROM users WHERE id = 4');
      if (user.rows.length > 0) {
          // Delete related data first just in case there's no CASCADE
          await client.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id = 4)');
          await client.query('DELETE FROM orders WHERE store_id = 4');
          await client.query('DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE user_id = 4)');
          await client.query('DELETE FROM products WHERE user_id = 4');
          await client.query('DELETE FROM categories WHERE user_id = 4');
          await client.query('DELETE FROM users WHERE id = 4');
          console.log('User 4 (kalkoul.dz) and all related data successfully deleted.');
      } else {
          console.log('User 4 does not exist.');
      }
      
      // Let's also check who is user_id 2 and 3 and 4 just to be sure.
      const users = await client.query('SELECT id, username, store_name FROM users');
      console.log('Current users:', users.rows);
      
  } catch (err) {
      console.error(err);
  } finally {
      await client.end();
  }
}
cleanDB();
