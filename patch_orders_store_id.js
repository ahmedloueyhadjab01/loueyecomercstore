const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

const targetStr = `        for (const item of requestedItems.values()) {
          const product = await trx.get(
            'SELECT * FROM products WHERE id = $1 AND is_active = 1',
            [item.id]
          );
          if (!product) { console.error("DEBUG:", { itemId: item.id, store_id }); throw new Error('أحد المنتجات غير متاح حاليا ' + item.id + ' store_id:' + store_id); }`;

const replaceStr = `        for (const item of requestedItems.values()) {
          const product = await trx.get(
            'SELECT * FROM products WHERE id = $1 AND is_active = 1',
            [item.id]
          );
          if (!product) { throw new Error('أحد المنتجات غير متاح حالياً'); }
          store_id = product.user_id; // auto-correct store_id to match the product's owner`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('routes/orders.js', code);
console.log('Patched order store_id auto-correction');
