const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /if \(!product\) \{ console\.error\("DEBUG:", \{ itemId: item\.id, store_id \}\); throw new Error\('[^']+'\); \}/g,
  `if (!product) { 
    throw new Error('أحد المنتجات غير متاح حاليا ' + item.id + ' store_id:' + store_id); 
  }`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Patched');
