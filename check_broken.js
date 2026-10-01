const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");

const startIdx = html.indexOf("            <!-- Left: Info & Form -->");
const endIdx = html.indexOf("  </main>");

console.log("Start:", startIdx, "End:", endIdx);
console.log("Characters between:", endIdx - startIdx);
console.log("First 100 chars of block:");
console.log(html.substring(startIdx, startIdx + 100));
console.log("Last 100 chars of block:");
console.log(html.substring(endIdx - 100, endIdx));
