const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
const bottomNav = `
  <!-- Bottom Mobile Navbar -->
  <nav class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
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
    <a href="/admin.html" class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors">
      <span class="text-xl mb-1">👤</span>
      <span class="text-[10px] font-bold">حسابي</span>
    </a>
  </nav>
</body>
`;
if (!html.includes('id="bottomCartCount"')) {
  html = html.replace('</body>', bottomNav);
  fs.writeFileSync('public/index.html', html);
}
