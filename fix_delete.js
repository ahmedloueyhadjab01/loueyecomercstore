const fs = require("fs");
let html = fs.readFileSync("public/product.html", "utf8");

const startIdx = html.indexOf("  </script>\n\n  \n  \n\n            <!-- Left: Info & Form -->");
let searchFrom = startIdx + 10;
const endMarker = "document.addEventListener(\"DOMContentLoaded\", loadProduct);\n  </script>";
const endIdx = html.indexOf(endMarker, searchFrom) + endMarker.length;

if (startIdx !== -1 && html.indexOf(endMarker, searchFrom) !== -1) {
   console.log("Found start at", startIdx, "and end at", endIdx);
   html = html.substring(0, startIdx + 11) + html.substring(endIdx);
   fs.writeFileSync("public/product.html", html, "utf8");
   console.log("Deleted broken block. New length:", html.length);
} else {
   console.log("Could not find markers.");
   console.log("startIdx:", startIdx);
   console.log("endIdx:", html.indexOf(endMarker, searchFrom));
}
