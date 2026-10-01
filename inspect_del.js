const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");
console.log("FROM:", html.substring(38400, 38450));
console.log("TO:", html.substring(57400, 57450));
