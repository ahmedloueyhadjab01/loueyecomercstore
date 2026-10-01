const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");
console.log("IndexOf </main> :", html.indexOf("</main>"));
