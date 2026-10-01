const fs = require("fs");
let code = fs.readFileSync("public/js/admin.js", "utf8");

// Remove the broken part from products loop
const regexBroken = /for \(const p of filteredProducts\) \{\s*const tr = document\.createElement\('tr'\);\s*tr\.className = '[^']+';\s*if \(o\.customer_phone && phoneCounts\[o\.customer_phone\] > 1\) \{[\s\S]*?\}\s*tr\.className = [^;]+;/;
code = code.replace(regexBroken, `for (const p of filteredProducts) {
   const tr = document.createElement('tr');
   tr.className = 'border-t border-slate-200/10 hover:bg-slate-50 transition-colors';`);

// Apply correctly to orders loop
const regexOrders = /for \(const o of orders\) \{\s*const tr = document\.createElement\('tr'\);\s*tr\.className = '[^']+';/;
code = code.replace(regexOrders, `for (const o of orders) {
   const tr = document.createElement('tr');
   tr.className = 'border-t border-slate-200/10 hover:bg-slate-50 transition-colors';
   if (o.customer_phone && phoneCounts[o.customer_phone] > 1) {
     if (!phoneColors[o.customer_phone]) {
       phoneColors[o.customer_phone] = bgColors[colorIndex % bgColors.length];
       colorIndex++;
     }
     tr.className = 'border-t border-slate-200/20 ' + phoneColors[o.customer_phone];
   }`);

fs.writeFileSync("public/js/admin.js", code, "utf8");
console.log("Regex fix applied!");
