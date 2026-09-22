const fs = require('fs');
const code = fs.readFileSync('public/js/store.js', 'utf8');

// I will look for the loop where products are added to grid
const idx = code.indexOf('for (const p of products) {');
console.log(code.substring(idx, idx + 2000));
