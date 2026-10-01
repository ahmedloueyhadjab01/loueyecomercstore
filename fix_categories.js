const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

const oldLoadCategories = `  const nav = document.getElementById('categoryNav');
  nav.querySelectorAll('.cat-btn:not([data-cat=""])').forEach((b) => b.remove());

  for (const cat of CATEGORY_TREE) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900';
    btn.dataset.cat = cat.id;
    btn.textContent = cat.name;
    nav.appendChild(btn);
  }`;

const newLoadCategories = `  const menu = document.getElementById('categoryDropdownMenu');
  if (menu) {
    menu.innerHTML = '';
    
    // "All Categories" option
    const allBtn = document.createElement('a');
    allBtn.href = "#";
    allBtn.className = 'cat-btn px-4 py-3 text-slate-800 hover:bg-slate-600 hover:text-white text-right text-xs sm:text-sm font-bold transition-colors block';
    allBtn.dataset.cat = "";
    allBtn.textContent = "كل التصنيفات";
    allBtn.onclick = (e) => { e.preventDefault(); selectMainCategory(""); document.getElementById('categoryDropdownMenu').classList.add('hidden'); };
    menu.appendChild(allBtn);

    for (const cat of CATEGORY_TREE) {
      const btn = document.createElement('a');
      btn.href = "#";
      btn.className = 'cat-btn px-4 py-3 text-slate-800 hover:bg-slate-600 hover:text-white text-right text-xs sm:text-sm font-bold transition-colors block';
      btn.dataset.cat = cat.id;
      btn.textContent = cat.name;
      btn.onclick = (e) => { e.preventDefault(); selectMainCategory(cat.id); document.getElementById('categoryDropdownMenu').classList.add('hidden'); };
      menu.appendChild(btn);
    }
  }`;

code = code.replace(oldLoadCategories, newLoadCategories);

// Also remove references to categoryNav in selectMainCategory
code = code.replace(`  const nav = document.getElementById('categoryNav');
  const subNav = document.getElementById('subCategoryNav');

  document.querySelectorAll('#categoryNav .cat-btn').forEach((b) => {`, `  document.querySelectorAll('#categoryDropdownMenu .cat-btn').forEach((b) => {`);

code = code.replace(`      document.querySelectorAll('#categoryNav .cat-btn').forEach((b) => {`, `      document.querySelectorAll('#categoryDropdownMenu .cat-btn').forEach((b) => {`);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Fixed loadCategories!");
