const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');

const regex = /generateProductCardHtml\([^]*?return `([^]*?)`;\s*}/;
const match = regex.exec(code);
if (match) {
    console.log(match[1].substring(0, 1000));
}
