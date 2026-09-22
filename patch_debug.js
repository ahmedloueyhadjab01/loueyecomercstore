const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

const replacement = `
    const res = await fetch(\`/api/products?\${params.toString()}\`);
    const products = await res.json();
    
    const empty = document.getElementById('emptyState');
    grid.innerHTML = '';
    
    // DEBUG: Show product count at the top
    const debugInfo = document.createElement('div');
    debugInfo.className = 'w-full p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-lg text-center font-bold text-sm';
    debugInfo.textContent = 'عدد المنتجات التي تم استرجاعها من السيرفر: ' + (products.error ? JSON.stringify(products) : products.length);
    grid.parentNode.insertBefore(debugInfo, grid);

`;

code = code.replace("    const res = await fetch(`/api/products?${params.toString()}`);\n    const products = await res.json();\n\n    if (!CURRENT_STORE_ID && products.length && products[0].user_id) {\n      CURRENT_STORE_ID = products[0].user_id;\n    }\n\n    const empty = document.getElementById('emptyState');\n    grid.innerHTML = '';", replacement);

fs.writeFileSync('public/js/store.js', code);
