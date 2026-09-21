const db = require('./db');

async function runDemoSeed() {
  console.log('🌱 بدء تعبئة أسعار التوصيل وتوليد بيانات تجريبية في PostgreSQL...');
  await db.initDb();

  // 1. تصنيفات
  const categoriesSeed = [
    { name: 'ملابس وأزياء', slug: 'fashion' },
    { name: 'إلكترونيات وساعات', slug: 'electronics' },
    { name: 'مستلزمات المنزل', slug: 'home-appliances' },
  ];

  const admin = await db.get("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  const adminId = admin ? admin.id : null;

  const catIds = [];
  for (const cat of categoriesSeed) {
    const existing = await db.get('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
    if (existing) {
      catIds.push(existing.id);
    } else {
      const res = await db.query(
        'INSERT INTO categories (user_id, name, slug) VALUES ($1, $2, $3) RETURNING id',
        [adminId, cat.name, cat.slug]
      );
      catIds.push(res.rows[0].id);
    }
  }

  // 2. منتجات
  const productsSeed = [
    {
      name: 'شوالة أحذية رياضية كلاسيكية (جملة)',
      price: 36000,
      cost_price: 18000,
      pack_quantity: 12,
      desc: 'شوالة تحتوي على 12 زوج حذاء رياضي مريح وبمقاسات متنوعة مخصصة لإعادة البيع بالجملة.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      catId: catIds[0],
      stock: 25,
    },
    {
      name: 'طرد ساعات ذكية Smart Watch (جملة)',
      price: 48000,
      cost_price: 24000,
      pack_quantity: 10,
      desc: 'طرد 10 ساعات ذكية مقاومة للماء مع شاشات AMOLED وتتبع النبض والخطوات.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      catId: catIds[1],
      stock: 18,
    },
    {
      name: 'شوالة سماعات بلوتوث لاسلكية (جملة)',
      price: 38000,
      cost_price: 18000,
      pack_quantity: 20,
      desc: 'شوالة 20 سماعة بلوتوث عالية الجودة بتقنية عزل الضوضاء.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      catId: catIds[1],
      stock: 40,
    },
  ];

  for (let i = 0; i < productsSeed.length; i++) {
    const p = productsSeed[i];
    const slug = `wholesale-product-${i + 1}-${Date.now()}`;
    await db.query(
      `INSERT INTO products (user_id, name, slug, description, price, cost_price, image, category_id, stock, pack_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [adminId, p.name, slug, p.desc, p.price, p.cost_price, p.image, p.catId, p.stock, p.pack_quantity]
    );
  }

  console.log('✅ تم إدخال التصنيفات والمنتجات التجريبية في PostgreSQL.');
  process.exit(0);
}

runDemoSeed().catch((err) => {
  console.error('❌ خطأ في seed_demo:', err);
  process.exit(1);
});
