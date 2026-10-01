const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");

let count = 0;
let pos = html.indexOf("</script>");
while (pos !== -1) {
    console.log("Found at:", pos);
    pos = html.indexOf("</script>", pos + 1);
}
