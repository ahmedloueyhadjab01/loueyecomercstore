const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

// replace the error being thrown
const targetStr = `          const product = await trx.get(
            'SELECT * FROM products WHERE id = $1 AND is_active = 1 AND user_id = $2',
            [item.id, store_id]
          );
          if (!product) throw new Error`;

code = code.replace(targetStr, `          const product = await trx.get(
            'SELECT * FROM products WHERE id = $1 AND is_active = 1 AND user_id = $2',
            [item.id, store_id]
          );
          if (!product) { console.error("DEBUG:", { itemId: item.id, store_id }); throw new Error`);

fs.writeFileSync('routes/orders.js', code);
console.log('Patched orders.js for debug');
