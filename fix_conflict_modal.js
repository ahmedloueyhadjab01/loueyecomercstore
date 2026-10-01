const fs = require("fs");

["public/index.html", "public/product.html"].forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  content = content.replace(
    /align-items:center; justify-content:center;/g,
    "align-items:flex-start; justify-content:center; padding-top:10vh; overflow-y:auto;"
  );
  
  content = content.replace(
    /width:100%; padding:1.5rem; text-align:right;" dir="rtl">/g,
    'width:100%; padding:1.5rem; text-align:right; max-height:80vh; overflow-y:auto;" dir="rtl">'
  );

  fs.writeFileSync(file, content, "utf8");
});
console.log("Fixed conflictModal positioning");
