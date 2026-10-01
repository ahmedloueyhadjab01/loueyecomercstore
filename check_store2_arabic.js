const fs = require("fs");
const html = fs.readFileSync("public/js/store2.js", "utf8");
const match = html.match(/conflictOldBox.*?innerHTML = '(.*?)'/);
if (match) console.log(match[1]);
