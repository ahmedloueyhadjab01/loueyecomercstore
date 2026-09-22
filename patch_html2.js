const fs = require('fs');

let indexHtml = fs.readFileSync('public/index.html', 'utf8');
indexHtml = indexHtml.replace(/<script src="\/js\/store\.js\?v=\d+"><\/script>/g, '<script src="/js/store.js?v=' + Date.now() + '"></script>');
fs.writeFileSync('public/index.html', indexHtml);

let prodHtml = fs.readFileSync('public/product.html', 'utf8');
prodHtml = prodHtml.replace(/<script src="\/js\/store\.js\?v=\d+"><\/script>/g, '<script src="/js/store.js?v=' + Date.now() + '"></script>');
fs.writeFileSync('public/product.html', prodHtml);

console.log("Cache busters bumped!");
