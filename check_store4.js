const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');
const idx = code.indexOf('async function loadProducts()');
const match = code.substring(idx).match(/function renderProductCard/);
if (match) {
    console.log("Found renderProductCard at:", idx + match.index);
}
const endIdx = code.indexOf('function createCard', idx) > -1 ? code.indexOf('function createCard', idx) : code.indexOf('function', idx + 50);
console.log("Next function at:", endIdx);
