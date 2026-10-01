const fs = require("fs");
const content = fs.readFileSync("live_srabt.html", "utf16le");
const idx = content.indexOf("الدفع عند");
console.log("Found at:", idx);
if (idx > 0) {
  console.log(content.substring(idx - 1000, idx + 2000));
}
