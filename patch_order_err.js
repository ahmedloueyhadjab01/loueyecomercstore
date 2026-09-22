const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /if \(!product\) throw new Error\(' "\.ŝ S \. "S<'\);/g,
  `if (!product) throw new Error('أحد المنتجات غير متاح حاليا ' + item.id + ' store_id:' + store_id);`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Added debug to orders error');
