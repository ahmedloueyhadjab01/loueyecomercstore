const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

// Remove the bad onclick="addToCart(...)" from store.js
const badOnclick = /\s*onclick="\$\{outOfStock \? '' : \`addToCart[^\}]+\}\"/g;
code = code.replace(badOnclick, '');

// Make the entire card clickable
const cardCreate = "const card = document.createElement('div');";
code = code.replace(cardCreate, "const card = document.createElement('div');\n      card.onclick = () => location.href = prodUrl;");

// Fix the event listeners for the add-to-cart button to stop propagation
code = code.replace(
  /btn\.addEventListener\('click', \(\) => {/g,
  `btn.addEventListener('click', (e) => {
          e.stopPropagation();`
);

fs.writeFileSync('public/js/store.js', code);
console.log('Fixed store.js');
