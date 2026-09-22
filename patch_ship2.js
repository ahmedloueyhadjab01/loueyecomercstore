const fs = require('fs');
let code = fs.readFileSync('routes/shipping.js', 'utf8');

code = code.replace(
  /free_shipping_threshold !== undefined && free_shipping_threshold !== '' \? Number\(free_shipping_threshold\) : 15000,\s*\]/g,
  `free_shipping_threshold !== undefined && free_shipping_threshold !== '' ? Number(free_shipping_threshold) : 15000,
        manual_provider_name || null
      ]`
);

fs.writeFileSync('routes/shipping.js', code);
console.log('Patched array parameters in shipping.js');
