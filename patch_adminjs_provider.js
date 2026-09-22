const fs = require('fs');
let code = fs.readFileSync('public/js/admin.js', 'utf8');

code = code.replace(
  /if \(form\.api_token\) form\.api_token\.value = config\.api_token \|\| '';/g,
  `if (form.api_token) form.api_token.value = config.api_token || '';\n      if (form.manual_provider_name) form.manual_provider_name.value = config.manual_provider_name || '';`
);

fs.writeFileSync('public/js/admin.js', code);
console.log('Patched admin.js');
