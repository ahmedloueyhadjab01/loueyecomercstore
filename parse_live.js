const fs = require("fs");
const content = fs.readFileSync("live_srabt.html", "utf8");
const jsdom = require("jsdom"); // We probably don't have jsdom.
// Let's just find "التوصيل السريع" or "الدفع عند الاستلام"
const idx = content.indexOf("الدفع عند الاستلام");
console.log("Found at:", idx);
if (idx > 0) {
  console.log(content.substring(idx - 1000, idx + 1500));
}
