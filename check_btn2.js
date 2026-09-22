const fs = require('fs');
const code = fs.readFileSync('public/js/admin.js', 'utf8');
const idx = code.indexOf('generate-label-btn');
console.log(code.substring(idx - 600, idx + 100));
