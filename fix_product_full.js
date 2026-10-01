const fs = require("fs");
let code = fs.readFileSync("public/product.html", "utf8");

// Find where el.innerHTML starts and ends, replace the whole template
const startMarker = "        el.innerHTML = `\n          <div class=\"grid md:grid-cols-2 gap-10\">";
const endMarker = "        `;\n        initExpressForm();";

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1) { console.error("START not found"); process.exit(1); }
if (endIdx === -1) { console.error("END not found"); process.exit(1); }

const newTemplate = `        el.innerHTML = \`
          <div class="grid md:grid-cols-2 gap-10">
            <!-- Right: Image -->
            <div class="w-full"><div class="w-full md:sticky md:top-28">
              <div class="relative group cursor-zoom-in" onclick="openLightbox()">
                 <img id="mainProductImage" src="\${mainImg}" class="w-full h-auto object-cover rounded shadow-sm" />
                 <div class="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow">
                   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                   اضغط للتكبير
                 </div>
              </div>
            </div></div>

            <!-- Left: Info & Form -->
            <div class="w-full">
              <h1 class="text-3xl md:text-4xl font-black text-slate-900 mb-3">\${escapeHtml(product.name)}</h1>
              <p class="text-2xl font-black text-slate-900 mb-6">\${money(product.price)} د.ج</p>
              
              <div class="mb-6 border border-gray-100 p-4 rounded-xl shadow-sm bg-white">
                <p class="text-[13px] font-bold text-slate-600 mb-4 text-center">للطلب ادخل معلوماتك في الخانات اسفله</p>
                <form id="expressForm" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <input type="text" id="expressName" placeholder="الاسم" class="w-full px-4 py-3 rounded border border-gray-300 text-right bg-white focus:outline-none focus:border-[#E52F20] font-bold" required>
                    <input type="tel" id="expressPhone" placeholder="رقم الهاتف" class="w-full px-4 py-3 rounded border border-gray-300 text-right bg-white focus:outline-none focus:border-[#E52F20] font-bold" required>
                  </div>
                  <select id="expressWilaya" class="w-full px-4 py-3 rounded border border-gray-300 text-right bg-white focus:outline-none focus:border-[#E52F20] font-bold appearance-none" required>
                    <option value="">اختر الولاية</option>
                  </select>
                  <div id="expressWilayaDetails" class="hidden space-y-4">
                    <select id="expressCommune" class="w-full px-4 py-3 rounded border border-gray-300 text-right bg-white focus:outline-none focus:border-[#E52F20] font-bold appearance-none" required>
                      <option value="">اختر البلدية</option>
                    </select>
                    <input type="text" id="expressAddress" placeholder="العنوان بالكامل" class="w-full px-4 py-3 rounded border border-gray-300 text-right bg-white focus:outline-none focus:border-[#E52F20] font-bold" required>
                    <div id="expressShippingOptionsBox" class="pt-2 border-t border-slate-100">
                      <p class="block text-[13px] font-bold text-slate-700 mb-2">طريقة التوصيل</p>
                      <div class="space-y-2">
                        <label class="express-delivery-option flex items-center gap-3 p-3 border border-[#E52F20] rounded cursor-pointer bg-red-50" data-type="desk">
                          <input type="radio" name="expressShipType" value="desk" checked class="hidden" />
                          <div class="flex-1 flex justify-between items-center">
                            <span class="text-sm font-semibold text-slate-800">توصيل لمكتب البريد</span>
                            <span id="expressPriceDesk" class="text-sm font-bold text-[#E52F20]">--</span>
                          </div>
                        </label>
                        <label class="express-delivery-option flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50" data-type="home">
                          <input type="radio" name="expressShipType" value="home" class="hidden" />
                          <div class="flex-1 flex justify-between items-center">
                            <span class="text-sm font-semibold text-slate-800">توصيل للمنزل</span>
                            <span id="expressPriceHome" class="text-sm font-bold text-[#E52F20]">--</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  \${variantsHtml}

                  <div class="flex items-center gap-2 mt-4">
                    <div class="flex items-center bg-gray-100 rounded border border-gray-300 shrink-0">
                      <button type="button" id="qtyMinus" class="px-4 py-3 text-gray-600 hover:text-black font-black text-xl leading-none">-</button>
                      <span id="expressQtyDisplay" class="w-10 text-center font-black text-lg">1</span>
                      <input type="hidden" id="expressQty" value="1">
                      <button type="button" id="qtyPlus" class="px-4 py-3 text-gray-600 hover:text-black font-black text-xl leading-none">+</button>
                    </div>
                    <button type="submit" class="flex-1 bg-[#E52F20] hover:bg-[#b01d12] text-white font-black py-3.5 rounded text-base transition-colors">تأكيد الطلب</button>
                    <button type="button" id="addToCartExpressBtn" class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded text-base transition-colors">أضف إلى السلة</button>
                  </div>
                </form>
              </div>

              <!-- Trust badges -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  \${svgHand}<span class="text-[13px] font-black text-slate-700 mt-1">الدفع عند الإستلام</span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  \${svgTruck}<span class="text-[13px] font-black text-slate-700 mt-1">توصيل سريع 58 ولاية</span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  \${svgCheck}<span class="text-[13px] font-black text-slate-700 mt-1">ضمان الجودة 100%</span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  \${svgHeadset}<span class="text-[13px] font-black text-slate-700 mt-1">خدمة ما بعد البيع</span>
                </div>
              </div>
            </div>
          </div>
        \`;
        initExpressForm();`;

code = code.slice(0, startIdx) + newTemplate + code.slice(endIdx + endMarker.length);

fs.writeFileSync("public/product.html", code, "utf8");
console.log("Done! startIdx=" + startIdx + " endIdx=" + endIdx);
