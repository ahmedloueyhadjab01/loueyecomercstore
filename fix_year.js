const fs = require("fs");
["public/index.html", "public/product.html"].forEach(file => {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(
    `document.getElementById('currentYear').textContent = new Date().getFullYear();`,
    `const yearEl = document.getElementById('currentYear'); if (yearEl) yearEl.textContent = new Date().getFullYear();`
  );
  fs.writeFileSync(file, html, "utf8");
});
console.log("Fixed year!");
