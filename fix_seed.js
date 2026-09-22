const fs = require('fs');
let code = fs.readFileSync('seed_full_store.js', 'utf8');

code = code.replace(
  /subtotal, delivery_price, total_price, created_at/g,
  `subtotal, delivery_price, total, created_at`
);

fs.writeFileSync('seed_full_store.js', code);
console.log('Fixed seeder columns');
