const fs = require('fs');
let code = fs.readFileSync('routes/settings.js', 'utf8');

code = code.replace(/ OR user_id IS NULL/g, '');
code = code.replace(/ OR \(user_id IS NULL AND \$1 IS NULL\)/g, '');
code = code.replace(/ OR \(\$1 IS NULL AND p\.user_id IS NULL\)/g, '');
code = code.replace(/\(user_id = \$1\)/g, 'user_id = $1');
code = code.replace(/\(p\.user_id = \$1\)/g, 'p.user_id = $1');

fs.writeFileSync('routes/settings.js', code);
console.log('Fixed settings.js');
