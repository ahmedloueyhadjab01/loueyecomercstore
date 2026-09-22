const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');
const idx = code.indexOf('function generateProductCardHtml');
const start = code.substring(idx - 200, idx + 200);
console.log(start);
