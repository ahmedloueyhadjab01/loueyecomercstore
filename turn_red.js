const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if(file !== "node_modules" && file !== ".git") results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith(".html") || filePath.endsWith(".js") || filePath.endsWith(".css")) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk("public");
files.forEach(f => {
  let content = fs.readFileSync(f, "utf8");
  content = content.replace(/--primary: #1d4ed8;/g, "--primary: #E52F20;");
  content = content.replace(/blue-700/g, "red-700");
  content = content.replace(/blue-900/g, "red-900");
  content = content.replace(/bg-blue-500/g, "bg-[#E52F20]");
  content = content.replace(/bg-blue-600/g, "bg-red-700");
  content = content.replace(/text-blue-500/g, "text-[#E52F20]");
  content = content.replace(/border-blue-500/g, "border-[#E52F20]");
  content = content.replace(/ring-blue-500/g, "ring-[#E52F20]");
  content = content.replace(/hover:text-blue-500/g, "hover:text-[#E52F20]");
  content = content.replace(/hover:border-blue-500/g, "hover:border-[#E52F20]");
  content = content.replace(/focus:border-blue-500/g, "focus:border-[#E52F20]");
  content = content.replace(/focus:ring-blue-500/g, "focus:ring-[#E52F20]");
  fs.writeFileSync(f, content, "utf8");
});
console.log("Turned red!");
