const express = require('express');
const db = require('../db');

const router = express.Router();

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCsv(str = '') {
  const s = String(str).replace(/"/g, '""');
  return `"${s}"`;
}

function fullUrl(p) {
  const base = (process.env.STORE_URL || '').replace(/\/$/, '');
  return p.startsWith('http') ? p : `${base}${p}`;
}

// خلاصة منتجات لفيسبوك و انستغرام (Meta Commerce Manager -> Add Catalog -> Data Feed -> ضع هذا الرابط)
router.get('/facebook.xml', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE is_active = 1').all();
  const storeName = escapeXml(process.env.STORE_NAME || 'My Store');
  const storeUrl = process.env.STORE_URL || '';

  let items = '';
  for (const p of products) {
    const link = `${storeUrl}/product.html?slug=${encodeURIComponent(p.slug)}`;
    const image = p.image ? fullUrl(p.image) : '';
    items += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(p.description || p.name)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>${p.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${p.price.toFixed(2)} DZD</g:price>
      <g:condition>new</g:condition>
      <g:brand>${storeName}</g:brand>
    </item>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${storeName}</title>
    <link>${escapeXml(storeUrl)}</link>
    <description>خلاصة منتجات ${storeName}</description>${items}
  </channel>
</rss>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// خلاصة منتجات لتيك توك شوب (بصيغة CSV يمكن استيرادها من TikTok Seller Center)
router.get('/tiktok.csv', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE is_active = 1').all();
  const storeUrl = process.env.STORE_URL || '';

  const header = 'id,title,description,availability,price,link,image_link,brand\n';
  let rows = '';
  for (const p of products) {
    const link = `${storeUrl}/product.html?slug=${encodeURIComponent(p.slug)}`;
    const image = p.image ? fullUrl(p.image) : '';
    rows += [
      p.id,
      escapeCsv(p.name),
      escapeCsv(p.description || p.name),
      p.stock > 0 ? 'in stock' : 'out of stock',
      p.price.toFixed(2),
      escapeCsv(link),
      escapeCsv(image),
      escapeCsv(process.env.STORE_NAME || ''),
    ].join(',') + '\n';
  }

  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.send(header + rows);
});

module.exports = router;
