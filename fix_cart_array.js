const fs = require("fs");
let content = fs.readFileSync("public/js/cart.js", "utf8");

content = content.replace(
  "return JSON.parse(localStorage.getItem(this.KEY)) || [];",
  "const parsed = JSON.parse(localStorage.getItem(this.KEY)); return Array.isArray(parsed) ? parsed : [];"
);

fs.writeFileSync("public/js/cart.js", content, "utf8");
console.log("Fixed Cart.get");
