const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');
const idx = code.indexOf('function generateProductCardHtml');
console.log(code.substring(idx, idx + 1000));
