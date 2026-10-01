const fs = require("fs");
// Copy the backup cleanly
fs.copyFileSync("C:\\Users\\pc\\Desktop\\temp_extract\\public\\product.html", "public/product.html");
console.log("Restored cleanly.");
