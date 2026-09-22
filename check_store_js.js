const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

const regex = /function loadProducts\(\) \{([\s\S]*?)function renderProductCard/g;
let match = regex.exec(code);
if(match) console.log(match[0].substring(0, 1000));
