const fs = require("fs");
let code = fs.readFileSync("public/product.html", "utf8");

// Fix colors
const oldColors = `variantsHtml += \`<label class="cursor-pointer">
                    <input type="radio" name="expressColor" value="\${c}" \${idx===0?'checked':''} class="hidden express-variant-radio" onchange="updateExpressVariant()" />
                    <div class="w-8 h-8 rounded-full border-2 border-transparent transition-all ring-1 ring-gray-300 peer-checked:ring-red-500 peer-checked:border-red-500" style="background-color: \${cCode}" title="\${c}"></div>
                 </label>\`;`;

const newColors = `variantsHtml += \`<label class="cursor-pointer">
                    <input type="radio" name="expressColor" value="\${c}" \${idx===0?'checked':''} class="peer hidden express-variant-radio" onchange="updateExpressVariant()" />
                    <div class="px-4 py-1.5 border border-gray-300 rounded text-sm font-bold bg-white text-slate-600 transition-colors peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500">\${c}</div>
                 </label>\`;`;

code = code.replace(oldColors, newColors);

// Fix sizes (add peer class)
const oldSizes = `variantsHtml += \`<label class="cursor-pointer">
                    <input type="radio" name="expressSize" value="\${s}" \${idx===0?'checked':''} class="hidden express-variant-radio" onchange="updateExpressVariant()" />
                    <div class="px-4 py-1.5 border border-gray-300 rounded text-sm font-bold bg-white text-slate-600 transition-colors peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500">\${s}</div>
                 </label>\`;`;

const newSizes = `variantsHtml += \`<label class="cursor-pointer">
                    <input type="radio" name="expressSize" value="\${s}" \${idx===0?'checked':''} class="peer hidden express-variant-radio" onchange="updateExpressVariant()" />
                    <div class="px-4 py-1.5 border border-gray-300 rounded text-sm font-bold bg-white text-slate-600 transition-colors peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500">\${s}</div>
                 </label>\`;`;

code = code.replace(oldSizes, newSizes);

fs.writeFileSync("public/product.html", code, "utf8");
console.log("Variants fixed!");
