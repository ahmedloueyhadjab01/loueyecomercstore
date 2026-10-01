const fs = require("fs");
const html = fs.readFileSync("public/product.html", "utf8");
const match = html.match(/<script>(.*?)<\/script>/s);
if (match) {
    fs.writeFileSync("temp_script2.js", match[1], "utf8");
}
