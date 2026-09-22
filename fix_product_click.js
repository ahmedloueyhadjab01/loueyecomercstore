const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');

// 1. Make the outermost div clickable
code = code.replace(
  /<div class="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group">/g,
  `<div class="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer" onclick="location.href='\${prodUrl}'">`
);

// 2. Add event.stopPropagation() to the cart button onclick
code = code.replace(
  /onclick="\$\{outOfStock \? '' : \(p\.has_variants \? \\\`location\.href='\\\$\\{prodUrl\\}'\\\` : \\\`Cart\.add/g,
  `onclick="\${outOfStock ? '' : (p.has_variants ? \`event.stopPropagation(); location.href='\${prodUrl}'\` : \`event.stopPropagation(); Cart.add`
);

fs.writeFileSync('public/product.html', code);
console.log('Fixed product.html');
