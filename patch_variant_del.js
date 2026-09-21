const fs = require('fs');
let code = fs.readFileSync('routes/products.js', 'utf8');

const oldVarDelete = /router\.delete\('\/:id\/variants\/:variantId'[\s\S]*?res\.json\(await serialize\(updated\)\);\s*\}\);/;
const newVarDelete = `router.delete('/:id/variants/:variantId', requireAuth, requireActiveSubscription, async (req, res) => {
  const product = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  if (!checkResourceOwnership(product.user_id, req, res)) return;

  const variant = await db.get('SELECT * FROM product_variants WHERE id = $1 AND product_id = $2', [req.params.variantId, req.params.id]);
  if (!variant) return res.status(404).json({ error: 'الخيار غير موجود' });
  if (variant.stock > 0) {
    return res.status(400).json({ error: 'لا يمكن حذف خيار يمتلك مخزوناً. قم بتصفير المخزون أولاً.' });
  }
  
  if (variant.image) {
    upload.deleteFiles([variant.image]);
  }

  await db.query('DELETE FROM product_variants WHERE id = $1', [req.params.variantId]);
  const updated = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);
  res.json(await serialize(updated));
});`;

code = code.replace(oldVarDelete, newVarDelete);
fs.writeFileSync('routes/products.js', code);
