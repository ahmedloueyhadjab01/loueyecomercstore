const fs = require('fs');
let code = fs.readFileSync('services/shippingService.js', 'utf8');
code = code.replace(
  /UPDATE orders[\s\S]*?SET tracking_status = \$1, return_reason = \$2[\s\S]*?WHERE id = \$4/,
  `UPDATE orders
           SET tracking_status = $1, return_reason = $2
           WHERE id = $3`
);
fs.writeFileSync('services/shippingService.js', code);
console.log('Fixed shippingService.js $4 to $3');
