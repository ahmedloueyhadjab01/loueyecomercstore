const fs = require('fs');
let code = fs.readFileSync('public/product.html', 'utf8');

code = code.replace(/image:'\$\{mainImg\}'/g, "image:'${mainImg.replace(/'/g, \"\\\\'\")}'");
code = code.replace(/location\.href='\$\{prodUrl\}'/g, "location.href='${prodUrl.replace(/'/g, \"\\\\'\")}'");

fs.writeFileSync('public/product.html', code);
console.log('Fixed quotes in product.html');
