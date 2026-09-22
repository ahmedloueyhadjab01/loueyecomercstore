const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');
const regex = /card\.className = 'bg-white(.*?)grid\.appendChild\(card\);/s;
let match = regex.exec(code);
if(match) console.log(match[0].length, "characters extracted");
