const { Client } = require('pg');
require('dotenv').config();

const updates = [
  { id: 48, img: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp' }, // سماعات
  { id: 49, img: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp' }, // ساعة ذكية
  { id: 50, img: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/1.webp' }, // باور بانك
  { id: 51, img: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/1.webp' }, // كابل
  { id: 52, img: 'https://cdn.dummyjson.com/product-images/mobile-accessories/monopod/1.webp' }, // حامل هاتف
  { id: 53, img: 'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp' }, // حذاء
  { id: 54, img: 'https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp' }, // قميص
  { id: 55, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600' }, // جينز
  { id: 57, img: 'https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp' }, // نظارات
  { id: 58, img: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=600' }, // سكاكين
  { id: 60, img: 'https://images.unsplash.com/photo-1585237832810-64214c776097?q=80&w=600' }, // خلاط
  { id: 61, img: 'https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/1.webp' }, // مصباح
  { id: 64, img: 'https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp' }, // عناية بالبشرة
  { id: 65, img: 'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp' }, // أحمر شفاه
  { id: 66, img: 'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp' }, // فرش مكياج
  { id: 67, img: 'https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/1.webp' }, // زيت أرجان
  { id: 56, img: 'https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/1.webp' }, // حقيبة
  { id: 59, img: 'https://images.unsplash.com/photo-1527515637-60e574fb3763?q=80&w=600' }, // ممسحة/تنظيف
  { id: 62, img: 'https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp' }, // منظم مكياج
  { id: 63, img: 'https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/1.webp' }  // عطر
];

async function update() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  for (const u of updates) {
    const imagesJson = JSON.stringify([u.img]);
    await client.query('UPDATE products SET images = $1 WHERE id = $2', [imagesJson, u.id]);
    console.log(`Updated product ${u.id}`);
  }
  await client.end();
}
update();
