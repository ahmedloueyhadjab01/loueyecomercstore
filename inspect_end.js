const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");
console.log(html.substring(57400, 57500));
