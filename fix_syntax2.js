const fs = require("fs");
let content = fs.readFileSync("public/js/store2.js", "utf8");

content = content.replace(
  "if(content) content.classList.add('-translate-x-full'); content.classList.remove('translate-x-0');",
  "if(content) { content.classList.add('-translate-x-full'); content.classList.remove('translate-x-0'); }"
);

fs.writeFileSync("public/js/store2.js", content, "utf8");
console.log("Syntax 2 fixed");
