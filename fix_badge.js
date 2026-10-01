const fs = require("fs");
function fix(file) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(
    /<span id="cartCountDesktopHeader">0<\/span>\s*د\.ج/g,
    '<span id="cartCountDesktopHeader">0</span> منتج'
  );
  fs.writeFileSync(file, content, "utf8");
  console.log("Fixed", file);
}
fix("public/index.html");
fix("public/product.html");
