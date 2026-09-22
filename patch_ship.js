const fs = require('fs');
let code = fs.readFileSync('routes/shipping.js', 'utf8');

code = code.replace(
  /free_shipping_threshold,\s*\} = req\.body;/g,
  `free_shipping_threshold,\n      manual_provider_name,\n    } = req.body;`
);

code = code.replace(
  /free_shipping_enabled, free_shipping_threshold, updated_at/g,
  `free_shipping_enabled, free_shipping_threshold, manual_provider_name, updated_at`
);

code = code.replace(
  /\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, CURRENT_TIMESTAMP\)/g,
  `) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)`
);

code = code.replace(
  /from_commune = EXCLUDED\.from_commune,/g,
  `from_commune = EXCLUDED.from_commune,\n        manual_provider_name = EXCLUDED.manual_provider_name,`
);

// We need to pass manual_provider_name to the params array
code = code.replace(
  /parseFloat\(free_shipping_threshold\) \|\| 15000\s*\]\s*\);/g,
  `parseFloat(free_shipping_threshold) || 15000,\n        manual_provider_name || null\n      ]);`
);

fs.writeFileSync('routes/shipping.js', code);
console.log('Patched shipping.js for saving manual_provider_name');
