const fs = require('fs');
const code = fs.readFileSync('routes/orders.js', 'utf8');
const match = code.match(/const allowed = \[([^\]]+)\]/);
if (match) console.log(match[1]);
