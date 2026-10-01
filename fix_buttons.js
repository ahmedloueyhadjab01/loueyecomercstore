const fs = require("fs");
let code = fs.readFileSync("public/product.html", "utf8");

const oldButtons = `<button type="submit" class="flex-1 bg-[#ff0000] hover:bg-red-700 text-white font-black py-3.5 rounded text-lg transition-colors whitespace-nowrap">
                        🛒 أطلب الآن
                      </button>
                      <button type="button" onclick="addToCartExpress()" class="px-5 py-3.5 bg-[#ff9900] hover:bg-[#e68a00] text-white font-bold rounded text-lg transition-colors shrink-0 flex items-center justify-center gap-2" title="أضف إلى السلة">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </button>`;

const newButtons = `<button type="submit" class="lekidi-btn flex-1 bg-[#ff0000] hover:bg-red-700 text-white font-black py-3.5 rounded text-lg transition-colors whitespace-nowrap">
                        أطلب الآن
                      </button>
                      <button type="button" onclick="addToCartExpress()" class="lekidi-btn px-5 py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded text-lg transition-colors shrink-0 flex items-center justify-center gap-2">
                        أضف إلى السلة
                      </button>`;

code = code.replace(oldButtons, newButtons);

// Wait, the SVG for "Add to cart" might be formatted slightly differently in the file.
// Let's use a regex to replace the whole buttons row:
const regex = /<div class="flex flex-row-reverse items-center gap-2 mt-4">[\s\S]*?<\/div>\s*<\/div>\s*`/g;
code = code.replace(regex, `<div class="flex flex-row-reverse items-center gap-2 mt-4">
                      <div class="flex items-center bg-gray-100 rounded border border-gray-300 shrink-0">
                        <button type="button" class="px-4 py-3 text-gray-600 hover:text-black font-black text-xl" onclick="updateQty(-1)">-</button>
                        <input type="number" id="expressQty" value="1" class="w-10 text-center bg-transparent font-black text-lg focus:outline-none pointer-events-none" readonly>
                        <button type="button" class="px-4 py-3 text-gray-600 hover:text-black font-black text-xl" onclick="updateQty(1)">+</button>
                      </div>
                      <button type="submit" class="flex-1 lekidi-btn bg-[#E52F20] hover:bg-[#b01d12] text-white font-black py-3.5 rounded text-lg transition-colors whitespace-nowrap">
                        تأكيد الطلب
                      </button>
                      <button type="button" onclick="addToCartExpress()" class="flex-1 lekidi-btn bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded text-lg transition-colors whitespace-nowrap">
                        أضف إلى السلة
                      </button>
                    </div>
                  </div>
          \``);

fs.writeFileSync("public/product.html", code, "utf8");
console.log("Buttons fixed!");
