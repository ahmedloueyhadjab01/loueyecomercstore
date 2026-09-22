const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');
code = code.replace(/>\?\?\?</g, '>نفد<');
fs.writeFileSync('public/js/store.js', code);
