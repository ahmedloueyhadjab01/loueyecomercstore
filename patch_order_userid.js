const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /'SELECT \* FROM products WHERE id = \$1 AND is_active = 1 AND user_id = \$2',/g,
  `'SELECT * FROM products WHERE id = $1 AND is_active = 1',`
);
code = code.replace(
  /\[item\.id, store_id\]/g,
  `[item.id]`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Removed user_id check from orders.js product validation');
