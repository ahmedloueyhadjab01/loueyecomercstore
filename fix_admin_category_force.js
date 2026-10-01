const fs = require("fs");
let code = fs.readFileSync("public/admin.html", "utf8");

// 1. Add HTML input
if (!code.includes('name="image"')) {
  code = code.replace(
    `<input required name="name" placeholder="اسم التصنيف" class="field w-full px-3 py-2 text-sm" />`,
    `<input required name="name" placeholder="اسم التصنيف" class="field w-full px-3 py-2 text-sm" />\n        <input name="image" type="file" accept="image/*" class="field w-full px-3 py-2 text-sm" />`
  );
}

// 2. Change JS payload construction
code = code.replace(
  `const payload = { 
          name: fd.get('name'), 
          parent_id: fd.get('parent_id') || null
        };`,
  `const payload = new FormData();
        payload.append('name', fd.get('name'));
        if (fd.get('parent_id')) payload.append('parent_id', fd.get('parent_id'));
        if (fd.get('image') && fd.get('image').size > 0) payload.append('image', fd.get('image'));`
);

// 3. Fix fetch call
code = code.replace(
  /body: JSON\.stringify\(payload\)/g,
  `body: payload`
);

// 4. Fix headers
const oldHeaders = `'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token`;
code = code.replace(new RegExp(oldHeaders, 'g'), `'Authorization': 'Bearer ' + token`);

// 5. Form open JS
code = code.replace(
  `document.querySelector('#categoryForm [name="name"]').value = '';`,
  `document.querySelector('#categoryForm [name="name"]').value = ''; document.querySelector('#categoryForm [name="image"]').value = '';`
);
code = code.replace(
  `document.querySelector('#categoryForm [name="name"]').value = cat.name;`,
  `document.querySelector('#categoryForm [name="name"]').value = cat.name; document.querySelector('#categoryForm [name="image"]').value = '';`
);


fs.writeFileSync("public/admin.html", code, "utf8");
console.log("Admin category force fixed!");
