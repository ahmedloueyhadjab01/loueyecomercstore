const fs = require("fs");
let code = fs.readFileSync("public/js/store.js", "utf8");
code = code.replace(
  `  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';`,
  `  const empty = document.getElementById('emptyState');
  if(grid) grid.innerHTML = ''; else return;`
);
fs.writeFileSync("public/js/store.js", code, "utf8");
console.log("Fixed store grid!");
