const fs = require('fs');
let js = fs.readFileSync('public/js/store.js', 'utf8');

// The button has a dynamic class: class="${outOfStock ? '... cursor-not-allowed' : '... transition-all duration-300'} w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
// We just need to add 'add-to-cart ' before the 'w-9 h-9'
js = js.replace(
  /} w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300">/g,
  '} add-to-cart w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300">'
);

fs.writeFileSync('public/js/store.js', js);
console.log('Fixed add-to-cart class missing in card');
