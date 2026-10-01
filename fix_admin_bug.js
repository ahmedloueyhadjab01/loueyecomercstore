const fs = require("fs");
let code = fs.readFileSync("public/js/admin.js", "utf8");

const brokenProductsCode = `for (const p of filteredProducts) {
   const tr = document.createElement('tr');
   tr.className = 'border-t border-slate-200/10 hover:bg-slate-50 transition-colors';
     if (o.customer_phone && phoneCounts[o.customer_phone] > 1) {
       if (!phoneColors[o.customer_phone]) {
         phoneColors[o.customer_phone] = bgColors[colorIndex % bgColors.length];
         colorIndex++;
       }
       tr.className = 'border-t border-slate-300 ' + phoneColors[o.customer_phone] + ' hover:opacity-90 transition-opacity';
     }`;

const fixedProductsCode = `for (const p of filteredProducts) {
   const tr = document.createElement('tr');
   tr.className = 'border-t border-slate-200/10 hover:bg-slate-50/50 transition-colors';`;

code = code.replace(brokenProductsCode, fixedProductsCode);

// Now for orders, let's fix it properly
// Find where the order loop is
const orderLoopStart = `for (const o of orders) {
   const tr = document.createElement('tr');
   tr.className = 'border-t border-slate-200/10';`;

const fixedOrderLoop = `for (const o of orders) {
   const tr = document.createElement('tr');
   tr.className = 'border-t border-slate-200/10 hover:bg-slate-50/50 transition-colors';
   if (o.customer_phone && phoneCounts[o.customer_phone] > 1) {
       if (!phoneColors[o.customer_phone]) {
         phoneColors[o.customer_phone] = bgColors[colorIndex % bgColors.length];
         colorIndex++;
       }
       tr.className = 'border-t border-slate-200 ' + phoneColors[o.customer_phone];
   }`;

code = code.replace(orderLoopStart, fixedOrderLoop);

fs.writeFileSync("public/js/admin.js", code, "utf8");
console.log("Admin JS fixed!");
