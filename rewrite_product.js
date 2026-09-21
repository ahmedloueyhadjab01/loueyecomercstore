const fs = require('fs');

let productHtml = fs.readFileSync('public/product.html', 'utf8');

// Replace standard emojis and styling to match the new beautiful design
productHtml = productHtml.replace(/bg-sand/g, 'bg-slate-50')
                         .replace(/text-ink/g, 'text-slate-900')
                         .replace(/border-ink/g, 'border-slate-200')
                         .replace(/border-gray-100/g, 'border-slate-200')
                         .replace(/bg-gray-50/g, 'bg-slate-50')
                         .replace(/bg-black/g, 'bg-blue-600')
                         .replace(/hover:bg-gray-800/g, 'hover:bg-blue-700')
                         .replace(/bg-rose-500/g, 'bg-red-500')
                         .replace(/bg-gold/g, 'bg-blue-600')
                         .replace(/text-terracotta/g, 'text-red-500')
                         .replace(/bg-forest-dark/g, 'bg-blue-600')
                         .replace(/bg-forest/g, 'bg-blue-500')
                         .replace(/text-forest-dark/g, 'text-blue-600');

// Fix bottom nav (replace old nav if it exists)
const bottomNavRegex = /<nav class="md:hidden fixed bottom-0[^>]*>[\s\S]*?<\/nav>/;
const newBottomNav = `
  <!-- شريط التنقل السفلي للهاتف -->
  <nav class="md:hidden bottom-nav fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-md border-t border-slate-200" style="padding-bottom: env(safe-area-inset-bottom);">
    <a href="/" class="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 transition-all relative group">
      <svg class="w-6 h-6 mb-1 transition-transform group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
      <span class="text-[10px] font-bold opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">الرئيسية</span>
    </a>
    <button id="mobileNavCart" class="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 transition-all relative group">
      <svg class="w-6 h-6 mb-1 transition-transform group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      <span class="text-[10px] font-bold opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">السلة</span>
      <span id="bottomCartCount" class="absolute top-2 right-4 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">0</span>
    </button>
  </nav>
`;

if (bottomNavRegex.test(productHtml)) {
  productHtml = productHtml.replace(bottomNavRegex, newBottomNav);
} else {
  productHtml = productHtml.replace('</body>', newBottomNav + '\n</body>');
}

// Add the script to bind the bottom cart safely
const eventListenerScript = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobileNavCart');
    if (btn) btn.addEventListener('click', window.openCart);
  });
</script>
</body>
`;
productHtml = productHtml.replace('</body>', eventListenerScript);

// Remove any inline onload from images (CSP fix)
productHtml = productHtml.replace(/onload="[^"]*"/g, '');

fs.writeFileSync('public/product.html', productHtml);
