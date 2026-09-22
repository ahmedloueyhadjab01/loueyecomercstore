const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');

code = code.replace(
  /onclick="\$\{outOfStock \? '' : \(p\.has_variants \? `location\.href='\$\{prodUrl\}'` : `Cart\.add/g,
  `onclick="\${outOfStock ? '' : (p.has_variants ? \`event.stopPropagation(); location.href='\${prodUrl}'\` : \`event.stopPropagation(); Cart.add`
);

fs.writeFileSync('public/product.html', code);
console.log('Fixed product.html');
