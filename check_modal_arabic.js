const fs = require("fs");
const html = fs.readFileSync("public/product.html", "utf8");
console.log(html.substring(html.length - 1500));
