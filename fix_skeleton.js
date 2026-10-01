const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

code = code.replace(
  `class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse"`,
  `class="lekidi-card animate-pulse"`
);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Skeleton fixed!");
