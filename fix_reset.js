const fs = require('fs');
let js = fs.readFileSync('routes/settings.js', 'utf8');

js = js.split('WHERE (user_id = $1 OR ($1 IS NULL AND user_id IS NULL))').join('WHERE user_id = $1 OR user_id IS NULL');

fs.writeFileSync('routes/settings.js', js);
console.log('Replaced all');
