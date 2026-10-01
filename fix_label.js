const fs = require("fs");
let content = fs.readFileSync("routes/shipping.js", "utf8");

content = content.replace("وصل شحن -", "بون شحن -");

content = content.replace(
  '<div class="total">',
  '<div class="total" style="font-size: 1.6rem; font-weight: 900; border: 3px solid #000; padding: 10px; margin-top: 15px; text-align: center; background: #000; color: #fff; border-radius: 8px;">'
);

content = content.replace(
  '<div class="barcode">\n          *${escapeHtml(order.id)}-${escapeHtml(String(order.phone).slice(-4))}*\n        </div>',
  ''
);

fs.writeFileSync("routes/shipping.js", content, "utf8");
console.log("Fixed label");
