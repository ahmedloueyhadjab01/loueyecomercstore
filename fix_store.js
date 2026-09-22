const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

// 1. Add cache buster
code = code.replace("if (SEARCH_QUERY) params.set('q', SEARCH_QUERY);", "if (SEARCH_QUERY) params.set('q', SEARCH_QUERY);\n  params.set('t', Date.now()); // منع التخزين المؤقت (Cache Busting)");

// 2. Fix the corrupted Arabic text in emptyState
const corruptedHtml = `empty.innerHTML = \`". S. "^ "% .ŝ .' "? "<strong>\${escapeHtmlSimple(SEARCH_QUERY)}</strong>"<br><span class="text-xs font-normal text-ink/60 mt-1.5 block">럝 . 럝 "". " S ^  . "? ^ "^?</span>\`;
    } else {
      empty.innerHTML = '" ^ .ŝ "S< ?S Ν "S?.';
    }`;
    
const fixedHtml = `empty.innerHTML = \`لم يتم العثور على منتجات مطابقة لـ "<strong>\${escapeHtmlSimple(SEARCH_QUERY)}</strong>"<br><span class="text-xs font-normal text-ink/60 mt-1.5 block">تأكد من كتابة الكلمات بشكل صحيح أو ابحث باسم الصنف أو الوصف</span>\`;
    } else {
      empty.innerHTML = 'لا توجد منتجات متاحة حالياً.';
    }`;

// Since the unicode might be completely mangled in PowerShell, I'll use regex to replace the entire if(SEARCH_QUERY) block for the empty state.
code = code.replace(/if \(SEARCH_QUERY\) {[\s\S]*?} else {[\s\S]*?}/m, `if (SEARCH_QUERY) {
      empty.innerHTML = \`لم يتم العثور على منتجات مطابقة لـ "<strong>\${escapeHtmlSimple(SEARCH_QUERY)}</strong>"<br><span class="text-xs font-normal text-ink/60 mt-1.5 block">تأكد من كتابة الكلمات بشكل صحيح أو ابحث باسم الصنف أو الوصف</span>\`;
    } else {
      empty.innerHTML = 'لا توجد منتجات متاحة حالياً.';
    }`);

fs.writeFileSync('public/js/store.js', code);
