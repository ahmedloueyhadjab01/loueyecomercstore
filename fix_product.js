const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");

// Fix Zoom (replace 'hidden' with 'flex')
html = html.replace(
  `getElementById('lightbox').classList.add('flex')`,
  `getElementById('lightbox').classList.replace('hidden', 'flex')`
);

// Fix QTY IDs
html = html.replace(/id="qtyInput"/g, `id="expressQty"`);

// Add manualQtyUpdate
const scriptToAdd = `
    function manualQtyUpdate(val) {
      let num = parseInt(val, 10);
      if (isNaN(num) || num < 1) num = 1;
      QTY = num;
      let e1 = document.getElementById('expressQty');
      let e2 = document.getElementById('mobileExpressQty');
      if(e1) e1.value = QTY;
      if(e2) e2.value = QTY;
    }
`;
html = html.replace('function updateQty(change) {', scriptToAdd + '\n    function updateQty(change) {');

// Remove pointer-events-none and readonly from qty inputs
html = html.replace(/pointer-events-none/g, '');
html = html.replace(/readonly/g, 'onchange="manualQtyUpdate(this.value)"');

// Fix Cart button logic in addToCartExpress (no need to change much actually, the default kalkoul might be different)

fs.writeFileSync("public/product.html", html, "utf8");
console.log("Fixed product.html!");
