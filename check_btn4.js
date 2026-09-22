const fs = require('fs');
const code = fs.readFileSync('public/js/admin.js', 'utf8');
const idx = code.indexOf('${trackingHtml}');
console.log(code.substring(idx - 100, idx + 200));
