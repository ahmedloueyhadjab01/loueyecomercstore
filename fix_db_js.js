const fs = require("fs");
let code = fs.readFileSync("db.js", "utf8");

code = code.replace(
  `parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      sort_order INTEGER DEFAULT 0,`,
  `parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      image VARCHAR(255),
      sort_order INTEGER DEFAULT 0,`
);

fs.writeFileSync("db.js", code, "utf8");
console.log("db.js categories image column added!");
