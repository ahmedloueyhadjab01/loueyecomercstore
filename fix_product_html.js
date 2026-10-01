const fs = require("fs");
let code = fs.readFileSync("public/product.html", "utf8");

// 1. Fix the quantity script error
code = code.replace(
  `document.getElementById('mobileExpressQty').value = QTY;`,
  `const mobQty = document.getElementById('mobileExpressQty'); if(mobQty) mobQty.value = QTY;`
);

// 2. Add the SVGs to the HTML
const featuresHtml = `
                <div class="mt-8 grid grid-cols-2 gap-4">
                  <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    \${svgHand}
                    <span class="text-[13px] font-black text-slate-700">الدفع عند الإستلام</span>
                  </div>
                  <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    \${svgTruck}
                    <span class="text-[13px] font-black text-slate-700">توصيل سريع 58 ولاية</span>
                  </div>
                  <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    \${svgCheck}
                    <span class="text-[13px] font-black text-slate-700">ضمان الجودة 100%</span>
                  </div>
                  <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    \${svgHeadset}
                    <span class="text-[13px] font-black text-slate-700">خدمة ما بعد البيع</span>
                  </div>
                </div>
`;

code = code.replace(
  `</form>\n                </div>\n              </div>`,
  `</form>\n                </div>\n` + featuresHtml + `\n              </div>`
);

fs.writeFileSync("public/product.html", code, "utf8");
console.log("Features added and script fixed!");
