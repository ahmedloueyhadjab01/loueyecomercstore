const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");

let count = 0;
let pos = html.indexOf("<!-- Left: Info & Form -->");
while (pos !== -1) {
    count++;
    console.log("Found at:", pos);
    pos = html.indexOf("<!-- Left: Info & Form -->", pos + 1);
}
console.log("Total count:", count);
