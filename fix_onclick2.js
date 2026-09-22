const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

code = code.replace(
  /onclick="CURRENT_CATEGORY='([^']*)'; loadProducts\(\); window.scrollTo\(0,0\);"/g,
  "onclick=\"selectMainCategory('$1'); window.scrollTo(0,0);\""
);

fs.writeFileSync('public/js/store.js', code);
console.log('Patched onclick function');
