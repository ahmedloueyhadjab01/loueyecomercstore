const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.sqlite");
db.all("SELECT id, name, is_active FROM products", [], (err, rows) => {
    console.log(rows);
});
