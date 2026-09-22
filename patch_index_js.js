const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace('<script src="/js/store.js"></script>', '<script src="/js/store.js?v=' + Date.now() + '"></script>');

fs.writeFileSync('public/index.html', html);
console.log("index.html patched with store.js cache buster");
