const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');
const idx = code.indexOf('generateProductCardHtml(p)');
const block = code.substring(code.indexOf('function generateProductCardHtml(p)'), code.indexOf('</script>', code.indexOf('function generateProductCardHtml(p)')));
console.log(block.substring(0, 3000));
