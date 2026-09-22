const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

code = code.replace("imgEl.addEventListener('load', () => imgEl.classList.remove('opacity-0'));", "imgEl.addEventListener('load', () => imgEl.classList.remove('opacity-0'));\n          imgEl.addEventListener('error', () => imgEl.classList.remove('opacity-0'));");

fs.writeFileSync('public/js/store.js', code);
