const fs = require('fs');
const code = fs.readFileSync('public/js/admin.js', 'utf8');
const match = code.match(/includes\(o\.status\) \? `\s*<div class="mt-1">\s*<button class="generate-label-btn/g);
const idx = code.indexOf('<button class="generate-label-btn');
console.log(code.substring(idx - 150, idx + 50));
