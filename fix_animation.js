const fs = require("fs");
let content = fs.readFileSync("public/js/store2.js", "utf8");

content = content.replace(
  "content.classList.remove('-translate-x-full')",
  "content.classList.remove('-translate-x-full'); content.classList.add('translate-x-0')"
);

content = content.replace(
  "content.classList.add('-translate-x-full')",
  "content.classList.add('-translate-x-full'); content.classList.remove('translate-x-0')"
);

fs.writeFileSync("public/js/store2.js", content, "utf8");
console.log("Animation fixed");
