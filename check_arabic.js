const fs = require("fs");
const html = fs.readFileSync("public/product.html", "utf8");
console.log(html.substring(0, 100));
console.log(html.indexOf("جاري التحميل") !== -1 ? "Arabic found" : "Arabic MISSING!");
