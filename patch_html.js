const fs = require('fs');

let prodHtml = fs.readFileSync('public/product.html', 'utf8');
prodHtml = prodHtml.replace(/<script src="\/js\/store\.js(\?v=\d+)?"\><\/script>/g, '<script src="/js/store.js?v=' + Date.now() + '"></script>');
fs.writeFileSync('public/product.html', prodHtml);

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js(\?v=\d+)?"\><\/script>/g, '<script src="/js/admin.js?v=' + Date.now() + '"></script>');
fs.writeFileSync('public/admin.html', adminHtml);

console.log("HTML files patched with cache busters");
