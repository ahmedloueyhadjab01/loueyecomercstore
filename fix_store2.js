const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");
code = code.replace(
  `const grid = document.getElementById('productsGrid');
    if (grid) {`,
  `const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (grid) {`
);
fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Fixed store2 grid!");
