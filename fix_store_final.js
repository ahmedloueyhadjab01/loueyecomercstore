const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

// 1. Add cache buster
code = code.replace(
  "if (SEARCH_QUERY) params.set('q', SEARCH_QUERY);",
  "if (SEARCH_QUERY) params.set('q', SEARCH_QUERY);\n  params.set('t', Date.now()); // Cache Buster"
);

// 2. Fix empty state string safely
code = code.replace(/if \(SEARCH_QUERY\) \{[\s\S]*?empty\.innerHTML = '.*';\n    \}/, `if (SEARCH_QUERY) {
      empty.innerHTML = \`<div class="text-center py-10"><p class="text-lg font-bold text-slate-800 mb-2">لم يتم العثور على منتجات مطابقة لـ "\${escapeHtml(SEARCH_QUERY)}"</p><p class="text-sm text-slate-500">تأكد من كتابة الكلمات بشكل صحيح أو ابحث باسم الصنف</p></div>\`;
    } else {
      empty.innerHTML = \`<div class="text-center py-10"><p class="text-lg font-bold text-slate-800">لا توجد منتجات متاحة حالياً.</p></div>\`;
    }`);

fs.writeFileSync('public/js/store.js', code);
console.log("store.js fixed!");
