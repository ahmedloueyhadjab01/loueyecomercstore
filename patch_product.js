const fs = require('fs');
let html = fs.readFileSync('public/product.html', 'utf8');

html = html.replace('bg-sand text-ink', 'bg-gray-50 text-gray-900 pb-20 md:pb-0');
html = html.replace(/colors:\s*\{[^}]+\}/, "colors: { ink: '#111827', forest: '#000000', sand: '#ffffff' }");

html = html.replace('class="brand-header sticky top-0 z-40"', 'class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"');
html = html.replace(/bg-sand\/60 focus:bg-white/g, 'bg-gray-100 focus:bg-white border-none shadow-inner');
html = html.replace(/class="btn-primary[^"']*/, 'class="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors shadow-sm hidden md:flex');
html = html.replace(/border-2 border-ink/g, 'border border-gray-100');
html = html.replace('<div class="md:hidden px-4 pb-3">', '<div class="md:hidden px-4 pb-3 pt-1">');

html = html.replace(
  'class="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 relative cursor-zoom-in group shadow-sm"',
  'class="aspect-square bg-gray-200 animate-pulse rounded-2xl overflow-hidden border border-gray-100 relative cursor-zoom-in group shadow-sm"'
);

// We need to carefully replace the img without breaking JS template literals.
// Since it's inside ` ` in JS:
html = html.replace(
  /<img id="mainProductImage"[^>]+>/,
  '<img id="mainProductImage" src="${GALLERY_IMAGES[0]}" class="w-full h-full object-contain p-2 transition-opacity duration-700 opacity-0 ${product.stock <= 0 ? \'grayscale\' : \'\'}" onload="this.classList.remove(\'opacity-0\'); this.parentElement.classList.remove(\'animate-pulse\'); this.parentElement.classList.add(\'bg-white\');" />'
);

const bottomNav = `
  <!-- Bottom Mobile Navbar -->
  <nav class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style="padding-bottom: env(safe-area-inset-bottom);">
    <a href="/" class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors">
      <span class="text-xl mb-1">🏠</span>
      <span class="text-[10px] font-bold">الرئيسية</span>
    </a>
    <button onclick="document.getElementById('searchInputMobile')?.focus(); window.scrollTo({top: 0, behavior: 'smooth'});" class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors">
      <span class="text-xl mb-1">🔍</span>
      <span class="text-[10px] font-bold">بحث</span>
    </button>
    <button onclick="openCart()" class="relative flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors">
      <span class="text-xl mb-1">🛒</span>
      <span class="text-[10px] font-bold">السلة</span>
      <span id="bottomCartCount" class="absolute top-1 right-5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">0</span>
    </button>
  </nav>
</body>`;

if (!html.includes('id="bottomCartCount"')) {
  html = html.replace('</body>', bottomNav);
}

fs.writeFileSync('public/product.html', html);
