const fs = require("fs");
let code = fs.readFileSync("public/admin.html", "utf8");

const oldHtml = `<input required name="name" placeholder=". "S?" class="field w-full px-3 py-2 text-sm" />`;

// Let's use a regex instead since the encoding of Arabic text is messed up in PowerShell string output.
const regex = /<input required name="name"[^>]+>/;
code = code.replace(regex, `$&
        <input name="image" placeholder="رابط صورة التصنيف (اختياري)" class="field w-full px-3 py-2 text-sm" />`);

// Also update the JS to send 'image' in the POST/PUT request!
// Let's find where the categoryForm is submitted.
const oldJs = /const payload = \{\s*name: fd\.get\('name'\),\s*parent_id: fd\.get\('parent_id'\) \|\| null\s*\};/;
const newJs = `const payload = { 
          name: fd.get('name'), 
          parent_id: fd.get('parent_id') || null,
          image: fd.get('image') || null
        };`;
code = code.replace(oldJs, newJs);

// Also need to populate the form if editing!
const oldEditJs = /document\.querySelector\('#categoryForm \[name="name"\]'\)\.value = cat\.name;/;
const newEditJs = `document.querySelector('#categoryForm [name="name"]').value = cat.name;
    document.querySelector('#categoryForm [name="image"]').value = cat.image || '';`;
code = code.replace(oldEditJs, newEditJs);

// Also clear the image field when adding
const oldAddJs = /document\.querySelector\('#categoryForm \[name="name"\]'\)\.value = '';/;
const newAddJs = `document.querySelector('#categoryForm [name="name"]').value = '';
  document.querySelector('#categoryForm [name="image"]').value = '';`;
code = code.replace(oldAddJs, newAddJs);

fs.writeFileSync("public/admin.html", code, "utf8");
console.log("Admin category image added!");
