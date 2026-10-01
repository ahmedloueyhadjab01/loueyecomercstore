require('dotenv').config();
const { Pool } = require('pg');

async function seedStore() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const userId = parseInt(process.env.MAIN_STORE_USER_ID) || 1;
    console.log('Seeding for user:', userId);

    const catClothesRes = await pool.query('INSERT INTO categories (name, user_id, image, slug) VALUES ($1, $2, $3, $4) RETURNING id', ['ملابس رجالية', userId, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80', 'mens-clothes' + Date.now()]);
    const catClothesId = catClothesRes.rows[0].id;

    const catAccRes = await pool.query('INSERT INTO categories (name, user_id, image, slug) VALUES ($1, $2, $3, $4) RETURNING id', ['إكسسوارات وساعات', userId, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', 'accessories' + Date.now()]);
    const catAccId = catAccRes.rows[0].id;

    const catShoesRes = await pool.query('INSERT INTO categories (name, user_id, image, slug) VALUES ($1, $2, $3, $4) RETURNING id', ['أحذية', userId, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'shoes' + Date.now()]);
    const catShoesId = catShoesRes.rows[0].id;

    const products = [
      {
        name: 'شورت رجالي صيفي مريح', slug: 'mens-summer-shorts-' + Date.now(),
        description: 'شورت قطني ممتاز مناسب لفصل الصيف والطلعات الخفيفة.',
        price: 3500, compare_price: 4500, category_id: catClothesId,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80'
      },
      {
        name: 'ساعة ذكية رياضية', slug: 'smart-watch-' + Date.now(),
        description: 'ساعة ذكية مضادة للماء تحسب النبض والخطوات بتصميم عصري.',
        price: 5500, compare_price: 7000, category_id: catAccId,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
      },
      {
        name: 'حذاء رياضي أنيق', slug: 'elegant-sneakers-' + Date.now(),
        description: 'حذاء رياضي خفيف ومريح جداً للمشي لمسافات طويلة.',
        price: 6500, compare_price: 8500, category_id: catShoesId,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
      },
      {
        name: 'حقيبة ظهر كلاسيكية', slug: 'classic-backpack-' + Date.now(),
        description: 'حقيبة ظهر متينة تناسب الرحلات والدراسة.',
        price: 4800, compare_price: 6000, category_id: catAccId,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'
      },
      {
        name: 'نظارات شمسية عصرية', slug: 'modern-sunglasses-' + Date.now(),
        description: 'نظارات شمسية بعدسات تحمي من الأشعة فوق البنفسجية.',
        price: 2500, compare_price: 3500, category_id: catAccId,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80'
      }
    ];

    for (const p of products) {
      const pRes = await pool.query(
        'INSERT INTO products (user_id, name, slug, description, price, compare_price, category_id, image, stock, has_variants) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
        [userId, p.name, p.slug, p.description, p.price, p.compare_price, p.category_id, p.image, 50, 1]
      );
      const pId = pRes.rows[0].id;

      await pool.query('INSERT INTO product_variants (product_id, label, color, size, stock) VALUES ($1, $2, $3, $4, $5)', [pId, 'أسود - L', 'أسود', 'L', 10]);
      await pool.query('INSERT INTO product_variants (product_id, label, color, size, stock) VALUES ($1, $2, $3, $4, $5)', [pId, 'أبيض - M', 'أبيض', 'M', 10]);
    }

    console.log('Done seeding!');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
seedStore();
