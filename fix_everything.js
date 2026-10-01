const fs = require("fs");
let code = fs.readFileSync("public/js/store.js", "utf8");

// 1. Fix grid.innerHTML
code = code.replace(
  `  const empty = document.getElementById('emptyState');\n  grid.innerHTML = '';`,
  `  const empty = document.getElementById('emptyState');\n  if (grid) grid.innerHTML = ''; else return;`
);

// 2. Fix loadCategories
const oldLoadCat = `async function loadCategories() {
  const params = new URLSearchParams();
  if (CURRENT_STORE_ID) params.set('store_id', CURRENT_STORE_ID);
  const res = await fetch(\`/api/categories?\${params.toString()}\`);
  CATEGORY_TREE = await res.json();

  const nav = document.getElementById('categoryNav');
  nav.querySelectorAll('.cat-btn:not([data-cat=""])').forEach((b) => b.remove());

  for (const cat of CATEGORY_TREE) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900';
    btn.dataset.cat = cat.id;
    btn.textContent = cat.name;
    nav.appendChild(btn);
  }

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    selectMainCategory(btn.dataset.cat);
  });
}`;

const newLoadCat = `async function loadCategories() {
  const params = new URLSearchParams();
  if (CURRENT_STORE_ID) params.set('store_id', CURRENT_STORE_ID);
  const res = await fetch(\`/api/categories?\${params.toString()}\`);
  CATEGORY_TREE = await res.json();

  const menu = document.getElementById('categoryDropdownMenu');
  if (menu) {
    menu.innerHTML = '';
    
    const allBtn = document.createElement('a');
    allBtn.href = "#";
    allBtn.className = 'cat-btn px-4 py-3 text-slate-800 hover:bg-slate-600 hover:text-white text-right text-xs sm:text-sm font-bold transition-colors block';
    allBtn.dataset.cat = "";
    allBtn.textContent = "كل التصنيفات";
    allBtn.onclick = (e) => { e.preventDefault(); selectMainCategory(""); document.getElementById('categoryDropdownMenu').classList.add('hidden'); document.getElementById('categoryDropdownMenu').classList.remove('flex'); };
    menu.appendChild(allBtn);

    for (const cat of CATEGORY_TREE) {
      const btn = document.createElement('a');
      btn.href = "#";
      btn.className = 'cat-btn px-4 py-3 text-slate-800 hover:bg-slate-600 hover:text-white text-right text-xs sm:text-sm font-bold transition-colors block';
      btn.dataset.cat = cat.id;
      btn.textContent = cat.name;
      btn.onclick = (e) => { e.preventDefault(); selectMainCategory(cat.id); document.getElementById('categoryDropdownMenu').classList.add('hidden'); document.getElementById('categoryDropdownMenu').classList.remove('flex'); };
      menu.appendChild(btn);
    }
  }
}`;
code = code.replace(oldLoadCat, newLoadCat);


// 3. Fix selectMainCategory
const oldSelect = `function selectMainCategory(catId) {
  const nav = document.getElementById('categoryNav');
  const subNav = document.getElementById('subCategoryNav');

  document.querySelectorAll('#categoryNav .cat-btn').forEach((b) => {
    const isActive = b.dataset.cat === catId;
    b.classList.toggle('active-cat', isActive);
    b.classList.toggle('dimmed', !isActive && catId !== '');
  });

  CURRENT_CATEGORY = catId;

  // إظهار التصنيفات الفرعية إذا كانت موجودة
  const parent = CATEGORY_TREE.find((c) => String(c.id) === String(catId));
  const children = parent && parent.children ? parent.children : [];

  if (children.length) {
    subNav.classList.remove('hidden');
    subNav.innerHTML =
      \`<button data-subcat="\${catId}" class="subcat-btn active-cat">الكل في \${escapeHtmlSimple(parent.name)}</button>\` +
      children.map((c) => \`<button data-subcat="\${c.id}" class="subcat-btn">\${escapeHtmlSimple(c.name)}</button>\`).join('');
    subNav.querySelectorAll('.subcat-btn').forEach((sb) => {
      sb.addEventListener('click', () => {
        subNav.querySelectorAll('.subcat-btn').forEach((b) => b.classList.remove('active-cat'));
        sb.classList.add('active-cat');
        CURRENT_CATEGORY = sb.dataset.subcat;
        loadProducts();
      });
    });
  } else {
    subNav.classList.add('hidden');
    subNav.innerHTML = '';
  }

  loadProducts();
}`;

const newSelect = `function selectMainCategory(catId) {
  const subNav = document.getElementById('subCategoryNav');

  document.querySelectorAll('#categoryDropdownMenu .cat-btn').forEach((b) => {
    const isActive = b.dataset.cat === catId;
    b.classList.toggle('active-cat', isActive);
  });

  CURRENT_CATEGORY = catId;

  const parent = CATEGORY_TREE.find((c) => String(c.id) === String(catId));
  const children = parent && parent.children ? parent.children : [];

  if (children.length && subNav) {
    subNav.classList.remove('hidden');
    subNav.innerHTML =
      \`<button data-subcat="\${catId}" class="subcat-btn active-cat">الكل في \${escapeHtmlSimple(parent.name)}</button>\` +
      children.map((c) => \`<button data-subcat="\${c.id}" class="subcat-btn">\${escapeHtmlSimple(c.name)}</button>\`).join('');
    subNav.querySelectorAll('.subcat-btn').forEach((sb) => {
      sb.addEventListener('click', () => {
        subNav.querySelectorAll('.subcat-btn').forEach((b) => b.classList.remove('active-cat'));
        sb.classList.add('active-cat');
        CURRENT_CATEGORY = sb.dataset.subcat;
        loadProducts();
      });
    });
  } else if (subNav) {
    subNav.classList.add('hidden');
    subNav.innerHTML = '';
  }

  loadProducts();
}`;
code = code.replace(oldSelect, newSelect);


// 4. Fix search clear
code = code.replace(
  `      document.querySelectorAll('#categoryNav .cat-btn').forEach((b) => {`,
  `      document.querySelectorAll('#categoryDropdownMenu .cat-btn').forEach((b) => {`
);

// 5. Fix null pointers for top-level event listeners
code = code.replace(/document\.getElementById\('checkoutOverlay'.*?\)\.addEventListener/g, "document.getElementById('checkoutOverlay')?.addEventListener");
code = code.replace(/wilayaSelect\.addEventListener/g, "wilayaSelect?.addEventListener");
code = code.replace(/nav\.addEventListener/g, "nav?.addEventListener");

// 6. Append dropdown toggle script at the end
code += `\n
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('categoryDropdownBtn');
  const menu = document.getElementById('categoryDropdownMenu');
  if (btn && menu) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
      menu.classList.toggle('flex');
    });
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
      }
    });
  }
});
`;

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Successfully rebuilt store2.js!");
