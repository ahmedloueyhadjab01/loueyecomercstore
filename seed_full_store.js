const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const VENDOR_ID = 2; // kalkoul.dz

const categories = [
  { name: 'إلكترونيات وهواتف', slug: 'electronics' },
  { name: 'ملابس وأحذية', slug: 'clothing' },
  { name: 'أدوات منزلية', slug: 'home' },
  { name: 'عطور وتجميل', slug: 'beauty' },
];

const productsData = [
  { name: 'سماعات بلوتوث لاسلكية', price: 3500, cost: 1500, catIdx: 0, has_var: false },
  { name: 'ساعة ذكية رياضية', price: 4200, cost: 2000, catIdx: 0, has_var: true },
  { name: 'باور بانك 10000mAh', price: 2500, cost: 1200, catIdx: 0, has_var: false },
  { name: 'كابل شحن سريع', price: 800, cost: 300, catIdx: 0, has_var: false },
  { name: 'حامل هاتف للسيارة', price: 1200, cost: 500, catIdx: 0, has_var: false },
  { name: 'حذاء رياضي مريح', price: 5500, cost: 2500, catIdx: 1, has_var: true },
  { name: 'قميص صيفي كاجوال', price: 2800, cost: 1000, catIdx: 1, has_var: true },
  { name: 'سروال جينز عصري', price: 4800, cost: 1800, catIdx: 1, has_var: true },
  { name: 'حقيبة ظهر مدرسية', price: 3500, cost: 1500, catIdx: 1, has_var: false },
  { name: 'نظارات شمسية كلاسيكية', price: 1500, cost: 600, catIdx: 1, has_var: false },
  { name: 'طقم سكاكين مطبخ', price: 3200, cost: 1200, catIdx: 2, has_var: false },
  { name: 'ممسحة أرضيات دوارة', price: 2900, cost: 1100, catIdx: 2, has_var: false },
  { name: 'خلاط كهربائي سريع', price: 6500, cost: 3000, catIdx: 2, has_var: false },
  { name: 'مصباح طاولة ليد', price: 1800, cost: 800, catIdx: 2, has_var: false },
  { name: 'منظم مكياج أكريليك', price: 2100, cost: 900, catIdx: 2, has_var: false },
  { name: 'عطر رجالي فخم 100مل', price: 8500, cost: 3500, catIdx: 3, has_var: false },
  { name: 'مجموعة العناية بالبشرة', price: 4500, cost: 2000, catIdx: 3, has_var: false },
  { name: 'أحمر شفاه مطفي', price: 1200, cost: 400, catIdx: 3, has_var: true },
  { name: 'فرش مكياج احترافية', price: 2400, cost: 900, catIdx: 3, has_var: false },
  { name: 'زيت أرجان طبيعي', price: 1900, cost: 700, catIdx: 3, has_var: false },
];

const algNames = ['أحمد', 'محمد', 'ياسين', 'أيمن', 'وليد', 'إسلام', 'فاطمة', 'أمينة', 'سارة', 'خديجة', 'يوسف', 'عبد الرؤوف', 'رياض', 'عادل', 'أسامة', 'هشام', 'زكريا', 'مروان', 'نبيل', 'كريم'];
const wilayas = [16, 31, 23, 19, 25, 9, 30, 39, 35, 13];
const statuses = ['قيد المراجعة', 'قيد المراجعة', 'تم التأكيد', 'تم التأكيد', 'قيد التوصيل', 'تم التوصيل', 'تم التوصيل', 'تم التوصيل', 'مرفوض', 'مرتجع'];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  try {
    await client.connect();
    console.log('Connected to DB. Seeding...');

    const catIds = [];
    for (const c of categories) {
      const res = await client.query(
        `INSERT INTO categories (user_id, name, slug) VALUES ($1, $2, $3) RETURNING id`,
        [VENDOR_ID, c.name, c.slug + '-' + Date.now()]
      );
      catIds.push(res.rows[0].id);
    }
    console.log('Categories inserted.');

    const prodIds = [];
    let pid = 1;
    for (const p of productsData) {
      const catId = catIds[p.catIdx];
      const img = `https://picsum.photos/400/500?random=${Date.now() + pid}`;
      const res = await client.query(
        `INSERT INTO products (user_id, name, slug, description, price, compare_price, cost_price, stock, has_variants, category_id, image, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1) RETURNING id`,
        [
          VENDOR_ID, p.name, `prod-${Date.now()}-${pid}`, 'هذا المنتج هو من أفضل المنتجات مبيعاً. مواصفات عالية الجودة، تصميم أنيق يناسب كل الأذواق.',
          p.price, p.price + 1000, p.cost, 100, p.has_var ? 1 : 0, catId, img
        ]
      );
      const newPid = res.rows[0].id;
      prodIds.push({ id: newPid, price: p.price, cost: p.cost, has_var: p.has_var, name: p.name });

      if (p.has_var) {
        await client.query(`INSERT INTO product_variants (product_id, label, stock, cost_price) VALUES ($1, $2, $3, $4)`, [newPid, 'صغير (S)', 50, p.cost]);
        await client.query(`INSERT INTO product_variants (product_id, label, stock, cost_price) VALUES ($1, $2, $3, $4)`, [newPid, 'متوسط (M)', 50, p.cost]);
        await client.query(`INSERT INTO product_variants (product_id, label, stock, cost_price) VALUES ($1, $2, $3, $4)`, [newPid, 'كبير (L)', 50, p.cost]);
      }
      pid++;
    }
    console.log(`Inserted ${productsData.length} products.`);

    let orderCount = 0;
    for (let i = 0; i < 45; i++) {
      const p1 = rand(prodIds);
      const p2 = Math.random() > 0.7 ? rand(prodIds) : null;
      
      const items = [{ id: p1.id, name: p1.name, price: p1.price, cost_price: p1.cost, qty: 1 }];
      if (p2 && p1.id !== p2.id) {
        items.push({ id: p2.id, name: p2.name, price: p2.price, cost_price: p2.cost, qty: 1 });
      }
      
      const subtotal = items.reduce((s, it) => s + it.price, 0);
      const status = rand(statuses);
      
      const daysAgo = Math.floor(Math.random() * 30);
      const dateStr = `NOW() - INTERVAL '${daysAgo} days'`;

      await client.query(
        `INSERT INTO orders (user_id, customer_name, phone, address, wilaya_code, commune, delivery_type, status, items, subtotal, delivery_price, total, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ${dateStr})`,
        [
          VENDOR_ID, rand(algNames) + ' ' + rand(algNames), '055' + Math.floor(Math.random()*9000000 + 1000000),
          'حي ' + rand(['السلام', 'الاستقلال', 'الشهداء', 'النصر', 'الوئام']), rand(wilayas), 'بلدية ' + rand(['الجزائر', 'وهران', 'عنابة', 'قسنطينة', 'سطيف']),
          Math.random() > 0.5 ? 'home' : 'desk', status, JSON.stringify(items), subtotal, 600, subtotal + 600
        ]
      );
      orderCount++;
    }
    console.log(`Inserted ${orderCount} orders.`);

    const platforms = ['facebook', 'tiktok', 'instagram'];
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const dateStr = `NOW() - INTERVAL '${daysAgo} days'`;
      await client.query(
        `INSERT INTO campaign_ad_spend (user_id, campaign_name, spend_amount, source, spend_date, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '${daysAgo} days', ${dateStr})`,
        [VENDOR_ID, 'حملة ' + rand(platforms) + ' - ' + (i+1), Math.floor(Math.random()*3000 + 500), rand(platforms)]
      );
    }
    console.log('Inserted ad campaigns.');

    console.log('Done seeding!');
  } catch (e) {
    console.error('Error seeding:', e);
  } finally {
    await client.end();
  }
}

seed();
