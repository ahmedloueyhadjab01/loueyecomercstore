const fs = require('fs');

let html = fs.readFileSync('public/product.html', 'utf8');

const injectionCode = `
      // --- NEW: RELATED PRODUCTS & CATEGORY BAR ---
      initSimilarAndCategories(product);
`;

html = html.replace("initSocialIcons('productSocialIcons', { size: 'w-11 h-11 text-xl' });", "initSocialIcons('productSocialIcons', { size: 'w-11 h-11 text-xl' });\n" + injectionCode);

const helperFunctions = `
    // ---------- RELATED PRODUCTS & CATEGORY BAR ----------
    async function initSimilarAndCategories(product) {
      const mainEl = document.getElementById('productDetail');
      
      const container = document.createElement('div');
      container.className = 'mt-16 border-t-2 border-slate-200/50 pt-10';
      
      // 1. Similar Products Grid
      container.innerHTML += \`
        <h2 class="font-display text-2xl font-black text-slate-900 mb-6">.S.S .'S<O</h2>
        <div id="similarGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <p class="text-slate-400 font-bold col-span-full">.S ".?S...</p>
        </div>
        
        <h2 class="font-display text-2xl font-black text-slate-900 mb-4">S'? "SS.'</h2>
        <div id="productCategoryNav" class="flex overflow-x-auto gap-2 no-scrollbar pb-4 mb-6"></div>
        <div id="categoryProductsGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"></div>
      \`;
      
      mainEl.appendChild(container);

      // Fetch Similar Products (by category first, or just fallback)
      let similar = [];
      try {
        const storeParam = product.user_id ? \`&store_id=\${product.user_id}\` : '';
        const catParam = product.category_id ? \`&category_id=\${product.category_id}\` : '';
        const res = await fetch(\`/api/products?limit=9\${catParam}\${storeParam}\`);
        if (res.ok) {
          const data = await res.json();
          similar = data.filter(p => p.id !== product.id).slice(0, 8); // Max 8
        }
      } catch (e) {}

      const simGrid = document.getElementById('similarGrid');
      if (similar.length) {
        simGrid.innerHTML = similar.map(p => generateProductCardHtml(p)).join('');
      } else {
        simGrid.innerHTML = '<p class="text-slate-500 font-bold col-span-full text-sm">" ^ .S.S .'S<O.</p>';
      }

      // Fetch Categories
      try {
        const storeParam = product.user_id ? \`?store_id=\${product.user_id}\` : '';
        const res = await fetch(\`/api/categories\${storeParam}\`);
        if (res.ok) {
          const cats = await res.json();
          const catNav = document.getElementById('productCategoryNav');
          catNav.innerHTML = \`<button class="p-cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-800 text-white shadow-sm" data-cat="">""</button>\` + 
            cats.map(c => \`<button class="p-cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" data-cat="\${c.id}">\${escapeHtml(c.name)}</button>\`).join('');
          
          catNav.querySelectorAll('.p-cat-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              // Update active state
              catNav.querySelectorAll('.p-cat-btn').forEach(b => {
                b.classList.remove('bg-slate-800', 'text-white', 'shadow-sm');
                b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-900');
              });
              btn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-900');
              btn.classList.add('bg-slate-800', 'text-white', 'shadow-sm');
              
              // Load products for category
              const cid = btn.dataset.cat;
              loadCategoryProducts(cid, product.user_id);
            });
          });
          
          // Initial load for "All"
          loadCategoryProducts('', product.user_id);
        }
      } catch (e) {}
    }

    async function loadCategoryProducts(catId, storeId) {
      const grid = document.getElementById('categoryProductsGrid');
      grid.innerHTML = '<p class="text-slate-400 font-bold col-span-full">.S ".?S...</p>';
      try {
        const storeParam = storeId ? \`&store_id=\${storeId}\` : '';
        const catParam = catId ? \`&category_id=\${catId}\` : '';
        const res = await fetch(\`/api/products?limit=12\${catParam}\${storeParam}\`);
        if (res.ok) {
          const products = await res.json();
          if (products.length) {
            grid.innerHTML = products.map(p => generateProductCardHtml(p)).join('');
          } else {
            grid.innerHTML = '<p class="text-slate-500 font-bold col-span-full text-sm">" ^ .S.S ?S "O ".SS.</p>';
          }
        }
      } catch (e) {}
    }

    function generateProductCardHtml(p) {
      const outOfStock = p.stock <= 0;
      const mainImg = p.image || '/img/placeholder.svg';
      const storeParam = CURRENT_STORE_ID ? \`&store_id=\${CURRENT_STORE_ID}\` : '';
      const prodUrl = \`/product.html?slug=\${encodeURIComponent(p.slug)}\${storeParam}\`;
      
      let colorDotsHtml = '';
      if (p.has_variants && p.variants && p.variants.length) {
        const distinctColors = [];
        const seen = new Set();
        for (const v of p.variants) {
          if (v.color && !seen.has(v.color)) {
            seen.add(v.color);
            distinctColors.push(v);
          }
        }
        if (distinctColors.length > 1) {
          colorDotsHtml = \`<div class="flex items-center gap-1 mt-1">\${distinctColors.slice(0, 5).map(c => \`<span class="w-3.5 h-3.5 rounded-full border-2 border-slate-900 shadow-xs inline-block" title="\${escapeHtml(c.color)}" style="background-color: \${c.color_code || '#ddd'}"></span>\`).join('')}\${distinctColors.length > 5 ? \`<span class="text-[10px] text-slate-900 font-black">+\${distinctColors.length - 5}</span>\` : ''}</div>\`;
        }
      }

      return \`
        <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group">
          <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden cursor-pointer" onclick="location.href='\${prodUrl}'">
            <img src="\${mainImg}" class="product-img w-full h-full object-cover transition-all duration-700 \${outOfStock ? 'grayscale' : 'group-hover:scale-110'}" />
            \${outOfStock ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">?</span>' : ''}
            <div class="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div class="p-4 flex flex-col gap-2 flex-1">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-black text-sm text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 transition-colors" onclick="location.href='\${prodUrl}'">\${escapeHtml(p.name)}</h3>
              \${p.compare_price > p.price ? \`<span class="bg-blue-50 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">-\${Math.round((1 - p.price/p.compare_price)*100)}%</span>\` : ''}
            </div>
            \${colorDotsHtml ? \`<div class="flex items-center gap-1.5 mt-0.5">\${colorDotsHtml}</div>\` : ''}
            <div class="mt-auto pt-2 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-lg font-black text-blue-600">\${money(p.price)}</span>
                \${p.compare_price > p.price ? \`<span class="text-[10px] text-gray-400 font-bold line-through">\${money(p.compare_price)}</span>\` : ''}
              </div>
              <button onclick="\${outOfStock ? '' : (p.has_variants ? \`location.href='\${prodUrl}'\` : \`addToCart(\${p.id}, '\${escapeHtml(p.name).replace(/'/g,"\\\\'")}', \${p.price}, '\${mainImg}'); showToast('. ? ".ŝ "% "" o.');\`)}" class="\${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'} add-to-cart w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300">
                \${outOfStock ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>' : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>'}
              </button>
            </div>
          </div>
        </div>
      \`;
    }
`;

html = html.replace("function setupVariantSelectors", helperFunctions + "\n    function setupVariantSelectors");

// We also need to fix the encoding of the Arabic strings! Since Node.js might read them properly as UTF-8, 
// I should use the proper Arabic text instead of these unicode garbled characters.
