const fs = require("fs");
const html = fs.readFileSync("public/product.html", "utf8");
// Replace catch(err) { console.error(err); ... } to also log err.stack to the UI
let newHtml = html.replace(
  /console\.error\(err\);\s*el\.innerHTML = '<p class="text-center text-red-500 py-20 font-bold">.*?<\/p>';/,
  "console.error(err); el.innerHTML = '<pre dir=\"ltr\" style=\"text-align:left;color:red;padding:20px;\">' + err.stack + '</pre>';"
);
fs.writeFileSync("public/product.html", newHtml, "utf8");
console.log("Updated error handling in product.html");
