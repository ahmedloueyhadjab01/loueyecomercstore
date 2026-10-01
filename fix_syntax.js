const fs = require("fs");
let content = fs.readFileSync("public/js/store2.js", "utf8");

content = content.replace(
  "setTimeout(() => content.classList.remove('-translate-x-full'); content.classList.add('translate-x-0'), 10);",
  "setTimeout(() => { content.classList.remove('-translate-x-full'); content.classList.add('translate-x-0'); }, 10);"
);

content = content.replace(
  "setTimeout(() => drawer.classList.add('hidden'); content.classList.remove('translate-x-0'), 300);",
  "setTimeout(() => { drawer.classList.add('hidden'); content.classList.remove('translate-x-0'); }, 300);"
);

fs.writeFileSync("public/js/store2.js", content, "utf8");
console.log("Syntax fixed");
