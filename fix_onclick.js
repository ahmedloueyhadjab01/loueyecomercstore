const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

code = code.replace(
  /onclick="CURRENT_CATEGORY='[^']+'; loadProducts\(\); window\.scrollTo\(0,0\);"/g,
  `onclick="selectMainCategory('${p.category_id || ''}'); window.scrollTo(0,0);"`
);

// Wait, p.category_id is interpolated when generating the string, so it's literal in the JS file!
// Let me write a replacement using standard string replacement
code = code.replace(
  /onclick="CURRENT_CATEGORY='(.*?)'; loadProducts\(\); window.scrollTo\(0,0\);"/g,
  `onclick="selectMainCategory('$1'); window.scrollTo(0,0);"`
);

fs.writeFileSync('public/js/store.js', code);
console.log('Patched onclick function');
