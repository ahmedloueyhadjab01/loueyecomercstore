const fs = require("fs");
let code = fs.readFileSync("public/js/admin.js", "utf8");

const targetLine = "for (const o of orders) {";
const replacement = `   const phoneCounts = {};
   for (const o of orders) {
     if (o.customer_phone) {
       phoneCounts[o.customer_phone] = (phoneCounts[o.customer_phone] || 0) + 1;
     }
   }

   let colorIndex = 0;
   const phoneColors = {};
   const bgColors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-yellow-100', 'bg-rose-100', 'bg-cyan-100'];

   for (const o of orders) {`;

code = code.replace(targetLine, replacement);

const targetClass = "tr.className = 'border-t border-slate-200/10';";
const replacementClass = `tr.className = 'border-t border-slate-200/10 hover:bg-slate-50 transition-colors';
   if (o.customer_phone && phoneCounts[o.customer_phone] > 1) {
     if (!phoneColors[o.customer_phone]) {
       phoneColors[o.customer_phone] = bgColors[colorIndex % bgColors.length];
       colorIndex++;
     }
     tr.className = 'border-t border-slate-300 ' + phoneColors[o.customer_phone] + ' hover:opacity-90 transition-opacity';
   }`;

code = code.replace(targetClass, replacementClass);

fs.writeFileSync("public/js/admin.js", code, "utf8");
console.log("Admin orders grouped fixed!");
