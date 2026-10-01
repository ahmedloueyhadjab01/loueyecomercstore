const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

const oldLoadCat = `for (const cat of CATEGORY_TREE) {
    if (menu) menu.appendChild(createCatBtn(cat.id, cat.name, true));
    if (nav) nav.appendChild(createCatBtn(cat.id, cat.name, false));
  }`;

const newLoadCat = `for (const cat of CATEGORY_TREE) {
    if (menu) menu.appendChild(createCatBtn(cat.id, cat.name, true));
    if (nav) nav.appendChild(createCatBtn(cat.id, cat.name, false));
  }
  
  const circlesContainer = document.getElementById('dynamicCategoryCircles');
  if (circlesContainer) {
    circlesContainer.innerHTML = '';
    circlesContainer.classList.remove('hidden');
    for (const cat of CATEGORY_TREE) {
      const circle = document.createElement('div');
      circle.className = 'flex flex-col items-center justify-center gap-3 cursor-pointer group';
      circle.onclick = () => { selectMainCategory(cat.id); window.scrollTo(0, document.getElementById('productsGrid')?.offsetTop - 100 || 0); };
      const img = cat.image || '/img/placeholder.svg';
      circle.innerHTML = \`
        <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md group-hover:border-[#E52F20] transition-colors relative">
          <img src="\${img}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="\${escapeHtmlSimple(cat.name)}" onerror="this.src='/img/placeholder.svg'">
        </div>
        <span class="text-sm sm:text-base font-black text-slate-800 text-center group-hover:text-[#E52F20] transition-colors">\${escapeHtmlSimple(cat.name)}</span>
      \`;
      circlesContainer.appendChild(circle);
    }
  }`;

code = code.replace(oldLoadCat, newLoadCat);
fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Circles added!");
