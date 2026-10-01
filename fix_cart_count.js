const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

code = code.replace(
  `document.getElementById('cartCount').textContent = count;`,
  `const cc = document.getElementById('cartCount'); if (cc) cc.textContent = count; const dcc = document.getElementById('cartCountDesktopHeader'); if(dcc) dcc.textContent = count;`
);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Cart count fixed!");
