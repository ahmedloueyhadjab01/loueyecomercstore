const fs = require('fs');
const js = fs.readFileSync('public/js/store.js', 'utf8');
const html = fs.readFileSync('public/index.html', 'utf8');

const matches = js.match(/getElementById\('([^']+)'\)/g);
const ids = [...new Set(matches.map(m => m.match(/'([^']+)'/)[1]))];

let missing = [];
for (let id of ids) {
  if (!html.includes('id="' + id + '"')) {
    missing.push(id);
  }
}
console.log('Missing IDs in index.html:', missing);
