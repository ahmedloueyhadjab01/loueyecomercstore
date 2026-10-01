const fs = require("fs");
let content = fs.readFileSync("public/product.html", "utf8");

content = content.replace(
  /const escapeHtml = \([^)]*\) => {[\s\S]*?};\n/g,
  ""
);

content = content.replace(
  /const money = \([^)]*\) => {[\s\S]*?};\n/g,
  ""
);

fs.writeFileSync("public/product.html", content, "utf8");
console.log("Removed duplicate globals");
