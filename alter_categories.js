const db = require('./db');
async function alterCategories() {
  try {
    await db.query(`ALTER TABLE categories ADD COLUMN image VARCHAR(255)`);
    console.log("Column 'image' added to categories table");
  } catch(e) {
    console.error("Error altering table, might already exist:", e.message);
  }
}
alterCategories();
