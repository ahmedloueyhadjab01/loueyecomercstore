const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');

const oldStr = `  if (identifier === '1' || identifier === 'default') {
    // Single-tenant mode: grab the first admin if ID=1 doesn't match
    vendor = await db.get("SELECT id, name, store_name, store_slug FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
  }`;

const newStr = `  if (identifier === '1' || identifier === 'default') {
    // Single-tenant mode
    if (process.env.MAIN_STORE_USER_ID) {
      vendor = await db.get("SELECT id, name, store_name, store_slug FROM users WHERE id = $1", [process.env.MAIN_STORE_USER_ID]);
    } else {
      vendor = await db.get("SELECT id, name, store_name, store_slug FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
    }
  }`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('routes/auth.js', code);
console.log('Fixed MAIN_STORE_USER_ID in auth.js');
