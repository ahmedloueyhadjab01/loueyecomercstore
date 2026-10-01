require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function seed() {
  try {
    const userId = parseInt(process.env.MAIN_STORE_USER_ID) || 1;
    console.log('Seeding for user:', userId);

    const catRes = await pool.query(
      'INSERT INTO categories (name, user_id) VALUES (, ) RETURNING id',
      ['إلكترونيات', userId]
    );
    const catId = catRes.rows[0].id;

    const prodRes1 = await pool.query(
      'INSERT INTO products (name, description, price, compare_price, category_id, user_id, is_active, stock) VALUES (, , , , , , , ) RETURNING id',
      ['سماعات رأس لاسلكية', 'سماعات بلوتوث بصوت نقي وعزل للضوضاء', 4500, 6000, catId, userId, true, 50]
    );
    const prod1Id = prodRes1.rows[0].id;

    await pool.query('INSERT INTO product_variants (product_id, color, size, stock) VALUES (, , , )', [prod1Id, 'أسود', 'One Size', 25]);
    
    const orderRes = await pool.query(
      'INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, customer_state, customer_municipality, total_amount, status) VALUES (, , , , , , , ) RETURNING id',
      [userId, 'أحمد محمد', '0555123456', 'حي الزيتون', 'الجزائر', 'الرويبة', 4500, 'pending']
    );
    const orderId = orderRes.rows[0].id;

    await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (, , , )',
      [orderId, prod1Id, 1, 4500]
    );

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    pool.end();
  }
}

seed();
