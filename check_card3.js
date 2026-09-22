const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');
const idx = code.indexOf('function generateProductCardHtml');
console.log(code.substring(idx + 2500, idx + 4000));
