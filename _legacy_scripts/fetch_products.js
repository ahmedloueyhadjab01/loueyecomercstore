const db = require("./db");
(async () => {
  try {
    const { rows } = await db.query("SELECT id, name FROM products");
    console.log("Products:", rows);
  } catch(e) {
    console.error("DB Error:", e);
  }
})();
