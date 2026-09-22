const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /\} "\s*\(\$\{variant\.label\}\)\s*S\s*\$\{latest\}\s*\?'\`\);\s*\}/g,
  '}'
);

code = code.replace(
  /\} "\s*S\s*\$\{latest\}\s*\?'\`\);\s*\}/g,
  '}'
);

fs.writeFileSync('routes/orders.js', code);
console.log('Cleaned up duplicates');
