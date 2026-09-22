const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

// 1. Cache buster
code = code.replace(
  "if (SEARCH_QUERY) params.set('q', SEARCH_QUERY);",
  "if (SEARCH_QUERY) params.set('q', SEARCH_QUERY);\n    params.set('t', Date.now());"
);

// 2. Empty state Arabic rendering
code = code.replace(/if \(SEARCH_QUERY\) \{[\s\S]*?empty\.innerHTML = '.*';\n    \}/, `if (SEARCH_QUERY) {
      empty.innerHTML = \`<div class="text-center py-10"><p class="text-lg font-bold text-slate-800 mb-2">لم يتم العثور على منتجات مطابقة لـ "\${escapeHtmlSimple(SEARCH_QUERY)}"</p><p class="text-sm text-slate-500">تأكد من كتابة الكلمات بشكل صحيح أو ابحث باسم الصنف</p></div>\`;
    } else {
      empty.innerHTML = \`<div class="text-center py-10"><p class="text-lg font-bold text-slate-800">لا توجد منتجات متاحة حالياً.</p></div>\`;
    }`);

// 3. ID mapping for UI
code = code.replace(/'wilayaSelect'/g, "'custWilaya'");
code = code.replace(/'communeSelect'/g, "'custCommune'");
code = code.replace(/'cartItems'/g, "'cartItemsList'");
code = code.replace(/'checkoutError'/g, "'checkoutError' /* */");
code = code.replace(/'cartOverlay'/g, "'checkoutOverlay' /* renamed overlay */"); 
code = code.replace(/'checkoutGrandTotal'/g, "'cartTotal'");

// 4. Wrap addEventListeners in if conditions
code = code.replace(/document\.getElementById\('([^']+)'\)\.addEventListener/g, "document.getElementById('$1')?.addEventListener");
code = code.replace(/document\.getElementById\('([^']+)'\)\?.addEventListener/g, "document.getElementById('$1')?.addEventListener");

// 5. Wrap communeSelect usages
code = code.replace(/communeSelect\.disabled/g, "if(communeSelect) communeSelect.disabled");
code = code.replace(/communeSelect\.innerHTML/g, "if(communeSelect) communeSelect.innerHTML");
code = code.replace(/communeSelect\.value/g, "(communeSelect ? communeSelect.value : '')");

fs.writeFileSync('public/js/store.js', code);
console.log("store.js fully patched!");
