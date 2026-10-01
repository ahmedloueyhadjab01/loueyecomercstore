const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

const oldClassName = `card.className = 'bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer';`;
const newClassName = `card.className = 'lekidi-card cursor-pointer';`;

const oldInnerHtmlRegex = /card\.innerHTML = `[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*`;/;

code = code.replace(oldClassName, newClassName);

code = code.replace(oldInnerHtmlRegex, `card.innerHTML = \`
  <img src="\${mainImg}" class="product-img opacity-0 w-full h-full object-cover transition-all duration-500" onload="this.classList.remove('opacity-0')" onerror="this.classList.remove('opacity-0')" />
  <div class="lekidi-card-body">
    <a href="\${prodUrl}" class="lekidi-title line-clamp-2">\${escapeHtml(p.name)}</a>
    \${colorDotsHtml ? \`<div class="flex justify-center gap-1">\${colorDotsHtml}</div>\` : ''}
    <div class="lekidi-price">\${money(p.price)}</div>
    <button class="lekidi-btn add-to-cart">\${addBtnLabel}</button>
  </div>
\`;`);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Card applied!");
