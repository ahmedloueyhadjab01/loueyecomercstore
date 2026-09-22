const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

const regex = /if \(SEARCH_QUERY\) \{[\s\S]*?\} else \{[\s\S]*?\}/;
code = code.replace(regex, `if (SEARCH_QUERY) {
      empty.innerHTML = \`<div class="text-center py-10"><p class="text-lg font-bold text-slate-800 mb-2">لم يتم العثور على منتجات مطابقة لـ "\${escapeHtmlSimple(SEARCH_QUERY)}"</p><p class="text-sm text-slate-500">تأكد من كتابة الكلمات بشكل صحيح أو ابحث باسم الصنف</p></div>\`;
    } else {
      empty.innerHTML = \`<div class="text-center py-10"><p class="text-lg font-bold text-slate-800">لا توجد منتجات متاحة حالياً.</p></div>\`;
    }`);

fs.writeFileSync('public/js/store.js', code);
console.log("store.js fixed for real!");
