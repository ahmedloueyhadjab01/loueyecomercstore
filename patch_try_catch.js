const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

const oldBlock = `  const res = await fetch(\`/api/products?\${params.toString()}\`);
  const products = await res.json();

  if (!CURRENT_STORE_ID && products.length && products[0].user_id) {
    CURRENT_STORE_ID = products[0].user_id;
  }

  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';`;

const newBlock = `  let products = [];
  try {
    const res = await fetch(\`/api/products?\${params.toString()}\`);
    products = await res.json();
  } catch (err) {
    alert("Error fetching products: " + err.message);
    return;
  }

  if (products.error) {
    alert("API Error: " + JSON.stringify(products.error));
    return;
  }

  if (!CURRENT_STORE_ID && products.length && products[0].user_id) {
    CURRENT_STORE_ID = products[0].user_id;
  }

  const empty = document.getElementById('emptyState');
  if (grid) grid.innerHTML = '';
  
  try {`;

code = code.replace(oldBlock, newBlock);

code = code.replace("  // إغلاق المودال\n  closeOrderModal();\n}", "  // إغلاق المودال\n  closeOrderModal();\n}\n\n} catch (err) {\n  alert('Render error: ' + err.message + '\\n' + err.stack);\n}\n");

fs.writeFileSync('public/js/store.js', code);
