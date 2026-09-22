const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');
const idx = code.indexOf('catNav.innerHTML = filteredCats');
console.log(code.substring(idx, idx + 1500));
