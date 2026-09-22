const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');
console.log(code.indexOf('async function loadProducts()'));
