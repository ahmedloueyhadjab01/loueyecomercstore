const fs = require('fs');
const storeCode = fs.readFileSync('public/js/store.js', 'utf8');
const prodCode = fs.readFileSync('public/product.html', 'utf8');

const storeCard = storeCode.match(/Cart\.add[^]*?showToast/);
const prodCard = prodCode.match(/Cart\.add[^]*?showToast/);

console.log("Store:", storeCard ? storeCard[0] : "null");
console.log("Prod:", prodCard ? prodCard[0] : "null");
