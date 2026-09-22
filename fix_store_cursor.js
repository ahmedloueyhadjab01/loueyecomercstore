const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

code = code.replace(
  /card\.className = 'bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group';/g,
  `card.className = 'bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer';`
);

fs.writeFileSync('public/js/store.js', code);
console.log('Fixed cursor pointer in store.js');
