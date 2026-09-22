const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');
code = code.replace(/<span class="absolute top-2 right-2 bg-red-500 text-white text-\[10px\] font-black px-2 py-1 rounded shadow-sm">.*?<\/span>/g, '<span class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">نفد</span>');
fs.writeFileSync('public/js/store.js', code);
