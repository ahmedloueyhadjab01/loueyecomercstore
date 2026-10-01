const fs = require("fs");
let script = fs.readFileSync("temp_script3.js", "utf8");
script = script.replace(/<\/script>[\s\S]*/g, '');
fs.writeFileSync("temp_script3.js", script, "utf8");
