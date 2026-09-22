const fs = require('fs');
let html = fs.readFileSync('public/product.html', 'utf8');

const oldFetchCats = `
      // Fetch Categories
      try {
        const storeParam = product.user_id ? \`?store_id=\${product.user_id}\` : '';
        const res = await fetch(\`/api/categories\${storeParam}\`);
        if (res.ok) {
          const cats = await res.json();
          const catNav = document.getElementById('productCategoryNav');
          catNav.innerHTML = \`<button class="p-cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-800 text-white shadow-sm" data-cat="">الكل</button>\` + 
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
      } catch (e) {}`;

const newFetchCats = `
      // Fetch Categories
      try {
        const storeParam = product.user_id ? \`?store_id=\${product.user_id}\` : '';
        const res = await fetch(\`/api/categories\${storeParam}\`);
        if (res.ok) {
          const cats = await res.json();
          // Remove the current product's category from the list
          const filteredCats = cats.filter(c => String(c.id) !== String(product.category_id));
          
          if (filteredCats.length === 0) {
            // Hide the category section if no other categories exist
            document.getElementById('productCategoryNav').previousElementSibling.classList.add('hidden');
            document.getElementById('productCategoryNav').classList.add('hidden');
            document.getElementById('categoryProductsGrid').classList.add('hidden');
            return;
          }

          const catNav = document.getElementById('productCategoryNav');
          catNav.innerHTML = filteredCats.map((c, i) => \`<button class="p-cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap \${i === 0 ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}" data-cat="\${c.id}">\${escapeHtml(c.name)}</button>\`).join('');
          
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
          
          // Initial load for the first filtered category
          const firstBtn = catNav.querySelector('.p-cat-btn');
          if (firstBtn) {
            loadCategoryProducts(firstBtn.dataset.cat, product.user_id);
          }
        }
      } catch (e) {}`;

// Wait, the original JS might have encoding issues (arabic words loaded in Node as weird characters if read poorly?).
// But wait, my script uses exact JS strings. Let's make sure the exact replace works.
// We can use RegExp with wildcards if exact string matching fails due to unicode chars.
const pattern = /\/\/ Fetch Categories[\s\S]*?\} catch \(e\) \{\}/;
html = html.replace(pattern, newFetchCats);

fs.writeFileSync('public/product.html', html);
console.log('Patched product.html categories bar');
