const fs = require("fs");
let content = fs.readFileSync("public/index.html", "utf8");

if (!content.includes('id="checkoutError"')) {
  content = content.replace(
    '<form id="checkoutForm" class="space-y-4">',
    '<div id="checkoutError" class="text-rose-600 font-bold text-center mb-4 hidden bg-rose-50 p-3 rounded-lg text-sm border border-rose-100"></div>\n        <form id="checkoutForm" class="space-y-4">'
  );
  fs.writeFileSync("public/index.html", content, "utf8");
  console.log("Added checkoutError");
}
