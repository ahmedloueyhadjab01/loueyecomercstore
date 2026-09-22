const fs = require('fs');
let html = fs.readFileSync('public/js/admin.js', 'utf8');

// Ensure delete buttons are red
html = html.replace(/class="del-order-btn text-blue-500/g, 'class="del-order-btn text-rose-600');
html = html.replace(/class="delete-spend-btn text-rose-500/g, 'class="delete-spend-btn text-rose-600');
html = html.replace(/class="btn-delete-variant text-blue-500/g, 'class="btn-delete-variant text-rose-600');
html = html.replace(/class="text-blue-500 font-extrabold text-xs hover:underline btn-remove-image/g, 'class="text-rose-600 font-extrabold text-xs hover:underline btn-remove-image');

fs.writeFileSync('public/js/admin.js', html);
console.log("admin.js red buttons patched");
