const fs = require("fs");
const html = fs.readFileSync("public/js/store2.js", "utf8");
const start = html.indexOf("const currentPhone");
console.log(html.substring(start, start + 1800));
