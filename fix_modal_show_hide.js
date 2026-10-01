const fs = require("fs");

// Fix in store2.js: use style directly when showing/hiding modal
let store = fs.readFileSync("public/js/store2.js", "utf8");
store = store
  .replaceAll(`modal.classList.remove('hidden');`, `modal.style.cssText = 'display:flex!important;position:fixed;inset:0;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:9999;padding:1rem;backdrop-filter:blur(4px);';`)
  .replaceAll(`modal.classList.add('hidden');`, `modal.style.display = 'none';`);
fs.writeFileSync("public/js/store2.js", store, "utf8");
console.log("store2.js modal show/hide fixed!");

// Fix in product.html inline script
let prod = fs.readFileSync("public/product.html", "utf8");
prod = prod
  .replaceAll(`modal.classList.remove('hidden');`, `modal.style.cssText = 'display:flex!important;position:fixed;inset:0;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:9999;padding:1rem;backdrop-filter:blur(4px);';`)
  .replaceAll(`modal.classList.add('hidden');`, `modal.style.display = 'none';`);
fs.writeFileSync("public/product.html", prod, "utf8");
console.log("product.html modal show/hide fixed!");
