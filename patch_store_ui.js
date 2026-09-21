const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

// Fix duplicate grid
code = code.replace("  const grid = document.getElementById('productsGrid');\n  const empty = document.getElementById('emptyState');", "  const empty = document.getElementById('emptyState');");

// Fix inline onload on images to comply with CSP and use a beautiful blue hover effect
const oldCardHtml = /card\.innerHTML = `[\s\S]*?`;/g;
const newCardHtml = `
      // Clean SVGs instead of emojis, beautiful blue theme
      const mainImg = p.image || '/img/placeholder.svg';
      card.innerHTML = \`
        <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden cursor-pointer" onclick="location.href='/product.html?id=\${p.id}'">
          <img src="\${mainImg}" class="product-img opacity-0 w-full h-full object-cover transition-all duration-700 \${outOfStock ? 'grayscale' : 'group-hover:scale-110'}" />
          \${outOfStock ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">نفد</span>' : ''}
          <div class="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div class="p-4 flex flex-col gap-2 flex-1">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-black text-sm text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 transition-colors" onclick="location.href='/product.html?id=\${p.id}'">\${escapeHtml(p.name)}</h3>
            \${p.compare_price > p.price ? \`<span class="bg-blue-50 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">-\${Math.round((1 - p.price/p.compare_price)*100)}%</span>\` : ''}
          </div>
          \${colorDotsHtml ? \`<div class="flex items-center gap-1.5 mt-0.5">\${colorDotsHtml}</div>\` : ''}
          <div class="mt-auto pt-2 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-lg font-black text-blue-600">\${money(p.price)}</span>
              \${p.compare_price > p.price ? \`<span class="text-[10px] text-gray-400 font-bold line-through">\${money(p.compare_price)}</span>\` : ''}
            </div>
            <button onclick="\${outOfStock ? '' : \`addToCart(\${p.id}, '\${escapeHtml(p.name).replace(/'/g,"\\\\'")}', \${p.price}, '\${mainImg}')\`}" class="\${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'} w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300">
              \${outOfStock ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>' : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>'}
            </button>
          </div>
        </div>
      \`;

      // Attach onload safely for CSP
      const imgEl = card.querySelector('.product-img');
      if (imgEl) {
        if (imgEl.complete) {
          imgEl.classList.remove('opacity-0');
        } else {
          imgEl.addEventListener('load', () => imgEl.classList.remove('opacity-0'));
        }
      }
`;
code = code.replace(oldCardHtml, newCardHtml);
fs.writeFileSync('public/js/store.js', code);
