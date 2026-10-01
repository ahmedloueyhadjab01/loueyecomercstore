const fs = require("fs");

let content = fs.readFileSync("public/product.html", "utf8");

// Fix 1: change cart badge text
content = content.replaceAll(`<span id="cartCountDesktopHeader">0</span> د.ج`, `<span id="cartCountDesktopHeader">0</span> منتج`);
content = content.replaceAll(`<span id="cartCountDesktopHeader">0</span> دج`, `<span id="cartCountDesktopHeader">0</span> منتج`);

// Fix 2: add description if missing
const priceLine = `<p class="text-2xl font-black text-[#E52F20] mb-4">\${money(product.price)} <span class="text-base font-bold text-slate-500">د.ج</span></p>`;
const oldPriceLine = `<p class="text-2xl font-black text-slate-900 mb-6">\${money(product.price)} د.ج</p>`;
const descriptionLine = `\${product.description ? \`<div class="mb-5 text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-right whitespace-pre-line">\${escapeHtml(product.description)}</div>\` : ''}`;

if (!content.includes("product.description")) {
  if (content.includes(oldPriceLine)) {
    content = content.replace(oldPriceLine, priceLine + "\n              " + descriptionLine);
  } else if (content.includes(priceLine)) {
    content = content.replace(priceLine, priceLine + "\n              " + descriptionLine);
  }
}

// Fix 3: replace the inline JS modal logic to use display flex instead of tailwind classes
// Only target the exact JS strings!
content = content.replaceAll(
  `modal.style.cssText = 'display:flex!important;position:fixed;inset:0;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:9999;padding:1rem;backdrop-filter:blur(4px);';`,
  `modal.style.display = 'flex';`
);
content = content.replaceAll(`modal.classList.remove('hidden');`, `modal.style.display = 'flex';`);
content = content.replaceAll(`modal.classList.add('hidden');`, `modal.style.display = 'none';`);

// Fix 4: remove old modal HTML and append the clean one
const cleanModalHTML = `
<!-- Conflict Modal: saved vs new customer data -->
<div id="conflictModal" style="display:none; position:fixed; inset:0; align-items:center; justify-content:center; background-color:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:99999; padding:1rem;">
  <div style="background:white; border-radius:1rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); max-width:24rem; width:100%; padding:1.5rem; text-align:right;" dir="rtl">
    <h3 style="font-size:1.125rem; font-weight:900; color:#0f172a; margin-bottom:0.5rem; margin-top:0;">اكتشفنا اختلافاً في بياناتك!</h3>
    <p style="font-size:0.875rem; color:#64748b; font-weight:700; margin-bottom:1.25rem; margin-top:0;">يبدو أن المعلومات التي أدخلتها مختلفة عن طلب سابق. أي بيانات تريد استخدامها؟</p>
    
    <div style="margin-bottom:1.25rem;">
      <div id="conflictOldBox" style="padding:0.75rem; border-radius:0.75rem; border:2px solid #e2e8f0; background:#f8fafc; font-size:0.875rem; font-weight:700; color:#334155; margin-bottom:0.75rem;"></div>
      <div id="conflictNewBox" style="padding:0.75rem; border-radius:0.75rem; border:2px solid #e2e8f0; background:#f8fafc; font-size:0.875rem; font-weight:700; color:#334155;"></div>
    </div>
    
    <div style="display:flex; gap:0.75rem;">
      <button id="conflictUseOld" style="flex:1; padding:0.75rem; border-radius:0.75rem; background:#f1f5f9; color:#1e293b; font-weight:900; font-size:0.875rem; border:none; cursor:pointer;">استخدم القديمة</button>
      <button id="conflictUseNew" style="flex:1; padding:0.75rem; border-radius:0.75rem; background:#E52F20; color:white; font-weight:900; font-size:0.875rem; border:none; cursor:pointer;">استخدم الجديدة</button>
    </div>
  </div>
</div>
`;

// Remove from main
content = content.replace(/<!-- Conflict Modal: saved vs new customer data -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>(\s*<\/main>)/, "$1");
content = content.replace(/<!-- Conflict Modal: saved vs new customer data -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>(\s*<\/main>)/, "$1");
content = content.replace(/<div id="conflictModal" class="hidden fixed inset-0[\s\S]*?<\/div>\s*<\/div>\s*<\/div>(\s*<\/main>)/, "$1");

// Only if we haven't already added it to body
if (!content.includes("z-index:99999; padding:1rem;")) {
  content = content.replace("</body>", cleanModalHTML + "\n</body>");
}

fs.writeFileSync("public/product.html", content, "utf8");
console.log("product.html repaired successfully!");
