const fs = require("fs");
let indexHtml = fs.readFileSync("public/index.html", "utf8");

// Add categoryNav back to index.html if missing
if (!indexHtml.includes('id="categoryNav"')) {
    indexHtml = indexHtml.replace(
        '<div id="subCategoryNav"',
        '<nav id="categoryNav" class="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide"></nav>\n      <div id="subCategoryNav"'
    );
    fs.writeFileSync("public/index.html", indexHtml, "utf8");
}

let storeJs = fs.readFileSync("public/js/store2.js", "utf8");

// Update loadCategories in store2.js to populate both
const oldLoadCat = /async function loadCategories\(\) \{[\s\S]*?const menu = document\.getElementById\('categoryDropdownMenu'\);[\s\S]*?if \(menu\) \{[\s\S]*?menu\.appendChild\(btn\);\s*\}\s*\}\s*\}/;

const newLoadCat = `async function loadCategories() {
  const params = new URLSearchParams();
  if (CURRENT_STORE_ID) params.set('store_id', CURRENT_STORE_ID);
  const res = await fetch(\`/api/categories?\${params.toString()}\`);
  CATEGORY_TREE = await res.json();

  const menu = document.getElementById('categoryDropdownMenu');
  const nav = document.getElementById('categoryNav');
  
  if (menu) menu.innerHTML = '';
  if (nav) nav.innerHTML = '';

  const createCatBtn = (catId, catName, isDropdown) => {
    if (isDropdown) {
      const a = document.createElement('a');
      a.href = "#";
      a.className = 'cat-btn px-4 py-3 text-slate-800 hover:bg-slate-600 hover:text-white text-right text-xs sm:text-sm font-bold transition-colors block';
      a.dataset.cat = catId;
      a.textContent = catName;
      a.onclick = (e) => { 
        e.preventDefault(); 
        selectMainCategory(catId); 
        document.getElementById('categoryDropdownMenu').classList.add('hidden'); 
        document.getElementById('categoryDropdownMenu').classList.remove('flex'); 
      };
      return a;
    } else {
      const btn = document.createElement('button');
      btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900';
      btn.dataset.cat = catId;
      btn.textContent = catName;
      btn.onclick = () => selectMainCategory(catId);
      return btn;
    }
  };
  
  if (menu) menu.appendChild(createCatBtn("", "كل التصنيفات", true));
  if (nav) nav.appendChild(createCatBtn("", "الكل", false));

  for (const cat of CATEGORY_TREE) {
    if (menu) menu.appendChild(createCatBtn(cat.id, cat.name, true));
    if (nav) nav.appendChild(createCatBtn(cat.id, cat.name, false));
  }
}`;

storeJs = storeJs.replace(oldLoadCat, newLoadCat);

// Update selectMainCategory to toggle active classes for BOTH nav and dropdown
const oldSelect = /function selectMainCategory\(catId\) \{[\s\S]*?const subNav = document\.getElementById\('subCategoryNav'\);[\s\S]*?document\.querySelectorAll\('#categoryDropdownMenu \.cat-btn'\)\.forEach\(\(b\) => \{[\s\S]*?b\.classList\.toggle\('active-cat', isActive\);[\s\S]*?\}\);/;

const newSelect = `function selectMainCategory(catId) {
  const subNav = document.getElementById('subCategoryNav');

  document.querySelectorAll('#categoryDropdownMenu .cat-btn, #categoryNav .cat-btn').forEach((b) => {
    const isActive = String(b.dataset.cat) === String(catId);
    b.classList.toggle('active-cat', isActive);
  });`;

storeJs = storeJs.replace(oldSelect, newSelect);

fs.writeFileSync("public/js/store2.js", storeJs, "utf8");
console.log("CategoryNav fixed!");
