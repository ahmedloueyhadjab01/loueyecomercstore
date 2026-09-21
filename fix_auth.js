const fs = require('fs');
let js = fs.readFileSync('routes/auth.js', 'utf8');

const regex = /router\.get\("\/subscription", requireAuth, \(req, res\) => \{\s+res\.json\(\{ is_active: true, plan: "annual", ends_at: new Date\(Date\.now\(\) \+ 365\*24\*60\*60\*1000\)\.toISOString\(\) \}\);\s+\}\);\s*/;
js = js.replace(regex, '');

fs.writeFileSync('routes/auth.js', js);
console.log('Removed duplicate /subscription');
