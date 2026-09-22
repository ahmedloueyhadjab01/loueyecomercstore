const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const VENDOR_ID = 2; // kalkoul.dz

const statuses = [
  'قيد المعالجة', 'قيد المعالجة', 'قيد المعالجة',
  'قيد التوصيل', 'قيد التوصيل', 'قيد التوصيل',
  'تم التسليم', 'تم التسليم', 'تم التسليم', 'تم التسليم', 'تم التسليم',
  'تعذر التوصيل', 'تعذر التوصيل',
  'مرتجع', 'مرتجع',
  'ملغي'
];
const algNames = ['أحمد', 'محمد', 'ياسين', 'أيمن', 'وليد', 'إسلام', 'فاطمة', 'أمينة', 'سارة', 'خديجة', 'يوسف', 'عبد الرؤوف', 'رياض', 'عادل', 'أسامة', 'هشام', 'زكريا', 'مروان', 'نبيل', 'كريم', 'طارق', 'سمير', 'حكيم', 'جمال'];
const wilayas = [16, 31, 23, 19, 25, 9, 30, 39, 35, 13, 1, 5, 6, 15, 34, 43, 18];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function reseedOrders() {
  try {
    await client.connect();
    console.log('Clearing old orders...');
    await client.query(`DELETE FROM orders WHERE user_id = $1`, [VENDOR_ID]);
    
    // Get existing products to link them
    const res = await client.query('SELECT id, name, price, cost_price FROM products WHERE user_id = $1', [VENDOR_ID]);
    const prodIds = res.rows;

    let orderCount = 0;
    for (let i = 0; i < 75; i++) {
      const p1 = rand(prodIds);
      const p2 = Math.random() > 0.8 ? rand(prodIds) : null; // 20% chance of 2 items
      
      const items = [{ id: p1.id, name: p1.name, price: Number(p1.price), cost_price: Number(p1.cost_price), qty: 1 }];
      if (p2 && p1.id !== p2.id) {
        items.push({ id: p2.id, name: p2.name, price: Number(p2.price), cost_price: Number(p2.cost_price), qty: 1 });
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
          'حي ' + rand(['السلام', 'الاستقلال', 'الشهداء', 'النصر', 'الوئام', 'المجاهدين', 'البساتين']), rand(wilayas), 'بلدية ' + rand(['الجزائر', 'وهران', 'عنابة', 'قسنطينة', 'سطيف', 'باتنة', 'بجاية']),
          Math.random() > 0.5 ? 'home' : 'desk', status, JSON.stringify(items), subtotal, 600, subtotal + 600
        ]
      );
      orderCount++;
    }
    console.log(`Inserted ${orderCount} diverse orders with correct statuses!`);
  } catch (e) {
    console.error('Error seeding:', e);
  } finally {
    await client.end();
  }
}

reseedOrders();
