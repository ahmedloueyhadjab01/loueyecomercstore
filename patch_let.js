const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /const { customer_name, phone, address, wilaya_code, commune, delivery_type, items, store_id } = req\.body;/g,
  `let { customer_name, phone, address, wilaya_code, commune, delivery_type, items, store_id } = req.body;`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Changed const to let for store_id');
