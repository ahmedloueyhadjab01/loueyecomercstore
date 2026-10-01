const fs = require("fs");
let code = fs.readFileSync("routes/auth.js", "utf8");
code = code.replace(
  `vendor = await db.get("SELECT * FROM public.users WHERE email = $1 AND is_active = true", [vendorIdentifier]);`,
  `vendor = await db.get("SELECT * FROM public.users WHERE email = $1 AND is_active = true", [vendorIdentifier]);
    if (!vendor) {
      vendor = await db.get("SELECT * FROM public.users WHERE name = $1 AND is_active = true", [vendorIdentifier]);
    }
    if (!vendor) {
      vendor = await db.get("SELECT * FROM public.users WHERE store_slug = $1 AND is_active = true", [vendorIdentifier]);
    }`
);
fs.writeFileSync("routes/auth.js", code, "utf8");
console.log("Fixed login!");
