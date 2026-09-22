const fs = require('fs');
let js = fs.readFileSync('public/js/store.js', 'utf8');

js = js.replace(
  /btn\.className = 'cat-btn whitespace-nowrap px-4 py-1\.5 rounded-full text-sm';/g,
  `btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap';`
);

fs.writeFileSync('public/js/store.js', js);
console.log('Fixed button classes generation');
