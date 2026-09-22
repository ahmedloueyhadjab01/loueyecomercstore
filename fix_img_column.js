const { Client } = require('pg');
require('dotenv').config();

async function fixImages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  const res = await client.query('SELECT id, images FROM products');
  for (const row of res.rows) {
      if (row.images) {
          try {
            const arr = JSON.parse(row.images);
            if (arr && arr.length > 0) {
                await client.query('UPDATE products SET image = $1 WHERE id = $2', [arr[0], row.id]);
            }
          } catch(e) {}
      }
  }
  
  console.log('Fixed image columns!');
  await client.end();
}
fixImages();
