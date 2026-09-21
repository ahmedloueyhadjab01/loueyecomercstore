const fs = require('fs');
let code = fs.readFileSync('routes/products.js', 'utf8');

const oldDelete = `router.delete('/:id', requireAuth, requireActiveSubscription, async (req, res) => {
  const product = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  if (!checkResourceOwnership(product.user_id, req, res)) return;
  await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});`;

const newDelete = `router.delete('/:id', requireAuth, requireActiveSubscription, async (req, res) => {
  const product = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  if (!checkResourceOwnership(product.user_id, req, res)) return;
  
  let imagesToDelete = [];
  if (product.image) imagesToDelete.push(product.image);
  if (product.images && product.images.length > 0) {
    if (typeof product.images === 'string') {
      try { imagesToDelete.push(...JSON.parse(product.images)); } catch(e){}
    } else {
      imagesToDelete.push(...product.images);
    }
  }
  
  const variants = await db.all('SELECT image FROM product_variants WHERE product_id = $1', [product.id]);
  variants.forEach(v => { if (v.image) imagesToDelete.push(v.image); });

  await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  
  if (imagesToDelete.length > 0) {
    upload.deleteFiles(imagesToDelete);
  }
  
  res.json({ success: true });
});`;

if (code.includes("router.delete('/:id'")) {
  // It might have arabic text encoded differently, so let's use regex
  const regex = /router\.delete\('\/:id'[\s\S]*?res\.json\(\{ success: true \}\);\s*\}\);/;
  code = code.replace(regex, newDelete);
  fs.writeFileSync('routes/products.js', code);
}
