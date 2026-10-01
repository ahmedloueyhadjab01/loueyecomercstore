const fs = require("fs");

// Fix 1: index.html - change "X دج" badge to "X منتج"
let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  `<span id="cartCountDesktopHeader">0</span> دج`,
  `<span id="cartCountDesktopHeader">0</span> منتج`
);
fs.writeFileSync("public/index.html", html, "utf8");
console.log("index.html cart badge fixed!");

// Fix 2: product.html - same fix
let prod = fs.readFileSync("public/product.html", "utf8");
prod = prod.replace(
  `<span id="cartCountDesktopHeader">0</span> دج`,
  `<span id="cartCountDesktopHeader">0</span> منتج`
);
fs.writeFileSync("public/product.html", prod, "utf8");
console.log("product.html cart badge fixed (if present)!");
