const fs = require("fs");
let code = fs.readFileSync("routes/categories.js", "utf8");

const uploadReq = `const db = require('../db');
const { requireAuth, checkResourceOwnership } = require('../middleware/auth');
const upload = require('./upload');`;

code = code.replace(`const db = require('../db');\nconst { requireAuth, checkResourceOwnership } = require('../middleware/auth');`, uploadReq);

code = code.replace(
  `router.post(
  '/',
  requireAuth,
  [`,
  `router.post(
  '/',
  requireAuth,
  upload.single('image'),
  [`
);

code = code.replace(
  `const { name, parent_id, image } = req.body;`,
  `const { name, parent_id } = req.body; const image = req.file ? '/uploads/' + req.file.filename : req.body.image;`
);

code = code.replace(
  `router.put(
  '/:id',
  requireAuth,
  [body('name').trim().isLength({ min: 1, max: 100 })],`,
  `router.put(
  '/:id',
  requireAuth,
  upload.single('image'),
  [body('name').trim().isLength({ min: 1, max: 100 })],`
);

code = code.replace(
  `const { name, image } = req.body;`,
  `const { name } = req.body; const image = req.file ? '/uploads/' + req.file.filename : req.body.image;`
);

fs.writeFileSync("routes/categories.js", code, "utf8");

let adminHtml = fs.readFileSync("public/admin.html", "utf8");
adminHtml = adminHtml.replace(
  `<input name="image" placeholder="رابط صورة التصنيف (اختياري)" class="field w-full px-3 py-2 text-sm" />`,
  `<input name="image" type="file" accept="image/*" class="field w-full px-3 py-2 text-sm" />`
);
adminHtml = adminHtml.replace(
  `const payload = { 
          name: fd.get('name'), 
          parent_id: fd.get('parent_id') || null,
          image: fd.get('image') || null
        };`,
  `const payload = new FormData();
        payload.append('name', fd.get('name'));
        if (fd.get('parent_id')) payload.append('parent_id', fd.get('parent_id'));
        if (fd.get('image') && fd.get('image').size > 0) payload.append('image', fd.get('image'));`
);

// We need to change JSON.stringify(payload) to just payload since it's FormData!
// Let's find the fetch call.
adminHtml = adminHtml.replace(
  /body: JSON\.stringify\(payload\)/g,
  `body: payload`
);

// We also need to remove 'Content-Type': 'application/json' for FormData!
const oldHeaders = `'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token`;
const newHeaders = `'Authorization': 'Bearer ' + token`;
adminHtml = adminHtml.replace(new RegExp(oldHeaders, 'g'), newHeaders);

fs.writeFileSync("public/admin.html", adminHtml, "utf8");

console.log("Upload fixed!");
