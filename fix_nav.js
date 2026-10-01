const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

code = code.replace(
  `nav.addEventListener('click', (e) => {`,
  `nav?.addEventListener('click', (e) => {`
);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Fixed nav null!");
