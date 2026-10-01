const fs = require("fs");
let content = fs.readFileSync("public/js/store2.js", "utf8");

content = content.replace(
  "btn.addEventListener('click', () => {",
  "btn.addEventListener('click', (e) => {\n            e.preventDefault();\n            e.stopPropagation();"
);

fs.writeFileSync("public/js/store2.js", content, "utf8");
console.log("Fixed bubbling");
