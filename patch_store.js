const fs = require('fs');
let js = fs.readFileSync('public/js/store.js', 'utf8');

const oldCardRegex = /card\.className = 'product-card[^;]+;/;
js = js.replace(oldCardRegex, "card.className = 'bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group';");

const oldCardInner = /card\.innerHTML = `[\s\S]*?<\/div>\s*`;/;
const newCardInner = 'card.innerHTML = `' + `
  <a href="${prodUrl}" class="aspect-[4/5] bg-gray-50 overflow-hidden block relative">
    <img src="${p.image || '/img/placeholder.svg'}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'opacity-50 grayscale' : ''}" loading="lazy" />
    ${outOfStock ? '<span class="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">نفذت الكمية</span>' : ''}
    ${!outOfStock && p.compare_price && p.compare_price > p.price ? \`<span class="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">وفر \${Math.round((1 - p.price / p.compare_price) * 100)}%</span>\` : ''}
  </a>
  <div class="p-4 flex flex-col flex-1 gap-2">
    <a href="${prodUrl}" class="text-sm font-bold text-gray-900 line-clamp-2 hover:text-black transition-colors">${escapeHtml(p.name)}</a>
    ${colorDotsHtml}
    <div class="flex flex-col gap-1 mt-auto pt-2">
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          ${p.compare_price > p.price ? \`<span class="text-[11px] text-gray-400 line-through">\${money(p.compare_price)}</span>\` : ''}
          <span class="text-lg font-black text-black">${money(p.price)}</span>
        </div>
        ${packBadge}
      </div>
      ${perPieceText}
    </div>
    <button class="add-to-cart w-full bg-black hover:bg-gray-800 text-white text-sm font-bold py-2.5 rounded-xl shadow-md transition-colors mt-2 flex items-center justify-center gap-2" ${outOfStock ? 'disabled' : ''} style="${outOfStock ? 'opacity:.5;cursor:not-allowed' : ''}">
      <span class="text-lg">${outOfStock ? '⚠️' : '🛒'}</span>
      ${addBtnLabel}
    </button>
  </div>
`;`;

js = js.replace(oldCardInner, newCardInner);

const updateCartCountRegex = /document\.getElementById\('cartCount'\)\.textContent = count;/g;
js = js.replace(updateCartCountRegex, "document.getElementById('cartCount').textContent = count; const bcc = document.getElementById('bottomCartCount'); if(bcc) bcc.textContent = count;");

fs.writeFileSync('public/js/store.js', js);
