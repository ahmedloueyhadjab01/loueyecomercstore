const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /for \(const item of requestedItems\.values\(\)\) \{[\s\S]*?if \(\!product\) [^\n]+/g,
  `for (const item of requestedItems.values()) {
          const product = await trx.get('SELECT * FROM products WHERE id = $1 AND is_active = 1', [item.id]);
          if (!product) throw new Error('أحد المنتجات غير متاح حالياً');
          store_id = product.user_id; // Fix to ensure order goes to the product owner`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Patched with regex');
