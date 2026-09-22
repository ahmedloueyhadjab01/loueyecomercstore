const { Client } = require('pg');
require('dotenv').config();

const cats = [
  { id: 11, name: 'ملابس رجالية' },
  { id: 12, name: 'ملابس نسائية' },
  { id: 13, name: 'أحذية رياضية وكلاسيكية' },
  { id: 14, name: 'حقائب وإكسسوارات' }
];

const prods = [
  // 11
  { name: 'قميص كاجوال كاروهات', img: 'https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/1.webp', cat: 11, price: 3500 },
  { name: 'تيشرت أسود أنيق', img: 'https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/1.webp', cat: 11, price: 2500 },
  { name: 'قميص صيفي نصف كم', img: 'https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp', cat: 11, price: 3200 },
  { name: 'قميص مربعات أزرق', img: 'https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/1.webp', cat: 11, price: 3400 },
  { name: 'جاكيت شتوي رجالي', img: 'https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/1.webp', cat: 11, price: 6500 },
  
  // 12
  { name: 'فستان صيفي خفيف', img: 'https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/1.webp', cat: 12, price: 4500 },
  { name: 'فستان أحمر كلاسيكي', img: 'https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/1.webp', cat: 12, price: 7500 },
  { name: 'فستان رمادي أنيق', img: 'https://cdn.dummyjson.com/product-images/tops/gray-dress/1.webp', cat: 12, price: 4200 },
  { name: 'تنورة جلدية مع كورسيه', img: 'https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/1.webp', cat: 12, price: 5800 },
  { name: 'فستان سهرة أسود', img: 'https://cdn.dummyjson.com/product-images/womens-dresses/black-women\'s-gown/1.webp', cat: 12, price: 8500 },

  // 13
  { name: 'حذاء رياضي نايك', img: 'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp', cat: 13, price: 9500 },
  { name: 'حذاء أبيض رياضي', img: 'https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/1.webp', cat: 13, price: 5500 },
  { name: 'حذاء بوما شبابي', img: 'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/1.webp', cat: 13, price: 7200 },
  { name: 'حذاء نسائي أحمر', img: 'https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/1.webp', cat: 13, price: 4800 },
  { name: 'حذاء كلاسيكي كعب', img: 'https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/1.webp', cat: 13, price: 6800 },

  // 14
  { name: 'حقيبة يد نسائية', img: 'https://cdn.dummyjson.com/product-images/womens-bags/blue-women\'s-handbag/1.webp', cat: 14, price: 4500 },
  { name: 'حقيبة ظهر بيضاء', img: 'https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/1.webp', cat: 14, price: 3800 },
  { name: 'حقيبة جلدية فاخرة', img: 'https://cdn.dummyjson.com/product-images/womens-bags/heshe-women\'s-leather-bag/1.webp', cat: 14, price: 6200 },
  { name: 'نظارات شمسية كلاسيكية', img: 'https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp', cat: 14, price: 2500 },
  { name: 'نظارات شمسية سوداء', img: 'https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp', cat: 14, price: 2800 }
];

async function updateClothing() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  // 1. Update Categories
  for (const c of cats) {
    await client.query('UPDATE categories SET name = $1, slug = $2 WHERE id = $3', [c.name, 'cat-' + c.id, c.id]);
  }

  // 2. Fetch all products
  const res = await client.query('SELECT id FROM products WHERE user_id = 2 ORDER BY id ASC');
  const productIds = res.rows.map(r => r.id);

  // 3. Update products
  for (let i = 0; i < productIds.length && i < prods.length; i++) {
    const pId = productIds[i];
    const data = prods[i];
    const imgJson = JSON.stringify([data.img]);
    await client.query(
      'UPDATE products SET name = $1, category_id = $2, price = $3, images = $4 WHERE id = $5',
      [data.name, data.cat, data.price, imgJson, pId]
    );
  }

  console.log('Successfully transformed store into a clothing store!');
  await client.end();
}
updateClothing();
