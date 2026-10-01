const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

// We know `nav` references in loadCategories are bad. 
// Let's just find `async function loadCategories() {` and replace everything until the NEXT function definition!
const startCat = code.indexOf("async function loadCategories() {");
const endCat = code.indexOf("function selectMainCategory(catId) {");

if (startCat !== -1 && endCat !== -1) {
  const newCat = `async function loadCategories() {
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
}

`;
  code = code.substring(0, startCat) + newCat + code.substring(endCat);
}

// Now replace selectMainCategory
const startSel = code.indexOf("function selectMainCategory(catId) {");
const endSel = code.indexOf("function escapeHtmlSimple(str) {");

if (startSel !== -1 && endSel !== -1) {
  const newSel = `function selectMainCategory(catId) {
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
}

`;
  code = code.substring(0, startSel) + newSel + code.substring(endSel);
}

// Finally check if grid null check is in loadProducts
if (!code.includes("if(grid) grid.innerHTML = ''; else return;")) {
  code = code.replace(
    `const empty = document.getElementById('emptyState');\n  grid.innerHTML = '';`,
    `const empty = document.getElementById('emptyState');\n  if (grid) grid.innerHTML = ''; else return;`
  );
}

// Replace null top level crashes
code = code.replace(/document\.getElementById\('checkoutOverlay'.*?\)\.addEventListener/g, "document.getElementById('checkoutOverlay')?.addEventListener");
code = code.replace(/wilayaSelect\.addEventListener/g, "wilayaSelect?.addEventListener");
code = code.replace(/nav\.addEventListener/g, "nav?.addEventListener");

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Manual fix completed!");
