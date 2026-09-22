const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

const replacement = `
    let targetContainer = grid;

    if (!CURRENT_CATEGORY && !SEARCH_QUERY) {
      let catId = p.category_id || 'other';
      let catName = p.category_name || 'أخرى';
      let catSection = document.getElementById('cat-section-' + catId);
      
      if (!catSection) {
        catSection = document.createElement('div');
        catSection.id = 'cat-section-' + catId;
        catSection.className = 'col-span-full mb-4 sm:mb-8 bg-white/50 rounded-3xl p-3 sm:p-5 border border-slate-200/50'; 
        
        catSection.innerHTML = \`
          <div class="flex justify-between items-center mb-4 px-1">
            <h2 class="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span class="w-1.5 h-6 sm:h-8 bg-blue-600 rounded-full inline-block"></span> 
              \${escapeHtml(catName)}
            </h2>
            <button onclick="CURRENT_CATEGORY='\${p.category_id || ''}'; loadProducts(); window.scrollTo(0,0);" class="text-blue-600 text-xs sm:text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
              عرض الكل 
              <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
          <div class="flex overflow-x-auto gap-3 sm:gap-5 snap-x snap-mandatory no-scrollbar pb-2" id="cat-slider-\${catId}">
          </div>
        \`;
        grid.appendChild(catSection);
      }
      
      targetContainer = catSection.querySelector('#cat-slider-' + catId);
      card.className = card.className + ' min-w-[160px] max-w-[160px] sm:min-w-[240px] sm:max-w-[240px] shrink-0 snap-start';
    }

    targetContainer.appendChild(card);
`;

const occurences = code.split('grid.appendChild(card);').length - 1;
console.log('Occurrences of grid.appendChild(card):', occurences);

if (occurences === 1) {
    code = code.replace(/grid\.appendChild\(card\);/, replacement);
    fs.writeFileSync('public/js/store.js', code);
    console.log('Patched correctly!');
} else {
    console.log('Error: Found', occurences, 'occurrences, expected 1');
}
