const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

const oldCode = `        if (p.has_variants) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = prodUrl;
          });
        } else {`;

const newCode = `        if (p.has_variants) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const firstVariant = (p.variants && p.variants.length > 0) ? p.variants[0] : null;
            Cart.add(p, 1, firstVariant);
            showToast('تمت إضافة المنتج إلى السلة بنجاح.');
            openCart();
          });
        } else {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Direct add fixed!");
