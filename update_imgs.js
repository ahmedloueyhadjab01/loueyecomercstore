const { Client } = require('pg');
require('dotenv').config();

const updates = [
  { id: 48, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop' }, // سماعات
  { id: 49, img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop' }, // ساعة ذكية
  { id: 50, img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=600&auto=format&fit=crop' }, // باور بانك
  { id: 51, img: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=600&auto=format&fit=crop' }, // كابل
  { id: 52, img: 'https://images.unsplash.com/photo-1582299878235-8b83ddfb59a1?q=80&w=600&auto=format&fit=crop' }, // حامل هاتف
  { id: 53, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' }, // حذاء
  { id: 54, img: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717?q=80&w=600&auto=format&fit=crop' }, // قميص
  { id: 55, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop' }, // جينز
  { id: 57, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop' }, // نظارات
  { id: 58, img: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=600&auto=format&fit=crop' }, // سكاكين
  { id: 60, img: 'https://images.unsplash.com/photo-1585237832810-64214c776097?q=80&w=600&auto=format&fit=crop' }, // خلاط
  { id: 61, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f7821?q=80&w=600&auto=format&fit=crop' }, // مصباح
  { id: 64, img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop' }, // عناية بالبشرة
  { id: 65, img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop' }, // أحمر شفاه
  { id: 66, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop' }, // فرش مكياج
  { id: 67, img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop' }, // زيت أرجان
  { id: 56, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop' }, // حقيبة
  { id: 59, img: 'https://images.unsplash.com/photo-1527515637-60e574fb3763?q=80&w=600&auto=format&fit=crop' }, // ممسحة/تنظيف
  { id: 62, img: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop' }, // منظم مكياج
  { id: 63, img: 'https://images.unsplash.com/photo-1523293115678-cb94657199bc?q=80&w=600&auto=format&fit=crop' }  // عطر
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
