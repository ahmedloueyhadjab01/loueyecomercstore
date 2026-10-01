const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

code = code.replace(
  `document.getElementById('checkoutOverlay' /* renamed overlay */).addEventListener('click', closeCart);`,
  `document.getElementById('checkoutOverlay' /* renamed overlay */)?.addEventListener('click', closeCart);`
);

code = code.replace(
  `wilayaSelect.addEventListener('change', async () => {`,
  `wilayaSelect?.addEventListener('change', async () => {`
);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Fixed nulls!");
