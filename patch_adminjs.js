const fs = require('fs');
let code = fs.readFileSync('public/js/admin.js', 'utf8');

code = code.replace(
  /document\.getElementById\('statShipping'\)\.textContent = `- \$\{money\(s\.total_shipping_cost\)\}`;/g,
  `document.getElementById('statShipping').textContent = \`- \${money(s.shipping_losses)}\`;`
);

fs.writeFileSync('public/js/admin.js', code);
console.log('Fixed statShipping in admin.js');
