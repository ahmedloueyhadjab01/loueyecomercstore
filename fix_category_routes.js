const fs = require("fs");
let code = fs.readFileSync("routes/categories.js", "utf8");

// Update POST
code = code.replace(
  `const { name, parent_id } = req.body;`,
  `const { name, parent_id, image } = req.body;`
);

code = code.replace(
  `'INSERT INTO categories (user_id, name, slug, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name.trim(), slug, parent_id || null]`,
  `'INSERT INTO categories (user_id, name, slug, parent_id, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name.trim(), slug, parent_id || null, image || null]`
);

// Update PUT
code = code.replace(
  `const { name } = req.body;`,
  `const { name, image } = req.body;`
);

code = code.replace(
  `'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), req.params.id]`,
  `'UPDATE categories SET name = $1, image = $2 WHERE id = $3 RETURNING *',
      [name.trim(), image || null, req.params.id]`
);

fs.writeFileSync("routes/categories.js", code, "utf8");
console.log("Routes fixed!");
