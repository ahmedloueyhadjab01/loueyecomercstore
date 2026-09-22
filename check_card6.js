const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');
const idx = code.indexOf('generateProductCardHtml(p)');
console.log(code.substring(idx + 3200, idx + 4200));
