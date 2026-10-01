const fs = require("fs");
let code = fs.readFileSync("routes/auth.js", "utf8");
code = code.replace(
  `} else {
      vendor = await db.get("SELECT id, name, store_name, store_slug FROM public.users WHERE store_name = $1", [identifier]);
    }`,
  `} else {
      vendor = await db.get("SELECT id, name, store_name, store_slug FROM public.users WHERE store_slug = $1", [identifier]);
    }`
);
fs.writeFileSync("routes/auth.js", code, "utf8");
console.log("Fixed store info!");
