const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');

const regex = /Related Products[\s\S]*?function renderRelated/i;
let match = regex.exec(code);
if(!match) {
    // try finding just "Related"
    const idx = code.indexOf('منتجات مشابهة');
    console.log("Found 'منتجات مشابهة' at:", idx);
    console.log(code.substring(idx - 200, idx + 1000));
} else {
    console.log(match[0]);
}
