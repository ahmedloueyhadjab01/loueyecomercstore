const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");
console.log(html.substring(38400, 38600));
