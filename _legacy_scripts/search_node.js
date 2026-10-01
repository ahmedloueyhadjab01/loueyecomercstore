const fs = require("fs");
const path = require("path");

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules" || file === ".git") continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDir(fullPath);
    } else if (fullPath.endsWith(".js") || fullPath.endsWith(".html") || fullPath.endsWith(".txt")) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes("430-6042")) {
        console.log("Found 430-6042 in", fullPath);
      }
      if (content.includes("بوليصة")) {
        console.log("Found بوليصة in", fullPath);
      }
      if (content.includes("بون")) {
        console.log("Found بون in", fullPath);
      }
    }
  }
}

searchDir(__dirname);
