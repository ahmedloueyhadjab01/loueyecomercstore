const fs = require("fs");
let content = fs.readFileSync("public/js/store2.js", "utf8");

content = content.replace(
  "row.className = 'flex items-center gap-3 border-b-2 border-ink/20 pb-3';",
  "row.className = 'flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-red-900/10 mb-3';"
);

fs.writeFileSync("public/js/store2.js", content, "utf8");
console.log("Updated row styling");
