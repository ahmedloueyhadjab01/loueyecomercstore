const fs = require("fs");
let code = fs.readFileSync("public/js/admin.js", "utf8");

const regex = /for \(const p of filteredProducts\) \{\s*const tr = document\.createElement\('tr'\);\s*tr\.className = 'border-t border-slate-200\/10 hover:bg-slate-50 transition-colors';\s*\}/;

code = code.replace(regex, `for (const p of filteredProducts) {
     const tr = document.createElement('tr');
     tr.className = 'border-t border-slate-200/10 hover:bg-slate-50 transition-colors';`);

fs.writeFileSync("public/js/admin.js", code, "utf8");
console.log("Brace fixed regex!");
