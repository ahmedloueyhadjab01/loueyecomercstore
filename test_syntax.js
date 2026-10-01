const fs = require("fs");
const html = fs.readFileSync("public/product.html", "utf8");
const start = html.indexOf("<script>") + 8;
const end = html.lastIndexOf("</script>");
const script = html.substring(start, end);
// remove any trailing </script> if it somehow got included
fs.writeFileSync("temp_script.js", script.replace(/<\/script>/g, ''), "utf8");
