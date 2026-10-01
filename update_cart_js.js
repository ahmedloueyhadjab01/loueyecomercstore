const fs = require("fs");
let content = fs.readFileSync("public/js/store2.js", "utf8");

// Open cart animation
content = content.replace(
  /content\.classList\.remove\('translate-x-full'\)/g,
  "content.classList.remove('-translate-x-full')"
);

// Close cart animation
content = content.replace(
  /content\.classList\.add\('translate-x-full'\)/g,
  "content.classList.add('-translate-x-full')"
);

content = content.replace('text-ink', 'text-white');

fs.writeFileSync("public/js/store2.js", content, "utf8");
console.log("Updated store2.js");
