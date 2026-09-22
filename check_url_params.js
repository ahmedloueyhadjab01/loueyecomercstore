const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');
const idx = code.indexOf('const urlParams');
console.log(code.substring(idx - 200, idx + 500));
