const fs = require('fs');
let js = fs.readFileSync('public/js/store.js', 'utf8');

// The generation of cat-btn
js = js.replace(
  `btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap';`,
  `btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900';`
);

// The toggle logic
js = js.replace(
  `b.classList.toggle('active-cat', isActive);\n      b.classList.toggle('dimmed', !isActive && catId !== '');`,
  `if (isActive) {
        b.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-900', 'opacity-50');
        b.classList.add('bg-slate-800', 'text-white', 'shadow-sm');
      } else {
        b.classList.remove('bg-slate-800', 'text-white', 'shadow-sm');
        b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-900');
        b.classList.toggle('opacity-50', catId !== '');
      }`
);

// The reset logic when searching
js = js.replace(
  `b.classList.toggle('active-cat', b.dataset.cat === '');\n        b.classList.remove('dimmed');`,
  `const isAll = b.dataset.cat === '';
        if (isAll) {
          b.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-900', 'opacity-50');
          b.classList.add('bg-slate-800', 'text-white', 'shadow-sm');
        } else {
          b.classList.remove('bg-slate-800', 'text-white', 'shadow-sm', 'opacity-50');
          b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-900');
        }`
);

// Update index.html to have the active classes for "الكل" by default
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(
  `<button class="cat-btn px-4 py-1.5 rounded-full text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors whitespace-nowrap active-cat" data-cat="">`,
  `<button class="cat-btn px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap bg-slate-800 text-white shadow-sm" data-cat="">`
);
fs.writeFileSync('public/index.html', html);
fs.writeFileSync('public/js/store.js', js);
console.log('Fixed category active styling');
