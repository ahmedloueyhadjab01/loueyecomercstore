const fs = require("fs");
let content = fs.readFileSync("public/product.html", "utf8");

// 1. We want to replace everything inside the Left Column:
// <div class="w-full md:w-1/2 lg:w-7/12"> ... up to <!-- Trust badges -->

const leftColStart = content.indexOf('<div class="w-full md:w-1/2 lg:w-7/12">');
const trustBadgesStart = content.indexOf('<!-- Trust badges -->');

if (leftColStart === -1 || trustBadgesStart === -1) {
    console.log("Could not find boundaries!");
    process.exit(1);
}

const newLeftColumn = `
          <div class="w-full md:w-1/2 lg:w-7/12">
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 mb-3">\${escapeHtml(product.name)}</h1>
            <p class="text-2xl font-black text-[#E52F20] mb-4">\${money(product.price)} <span class="text-base font-bold text-slate-500">منتج</span></p>
            
            \${product.description ? \`\\n<div class="mb-5 text-base text-slate-800 font-bold leading-relaxed text-right whitespace-pre-line rich-description">\${product.description}</div>\` : ''}

            <!-- Screenshot Tabs Section -->
            <div class="mt-8 mb-6">
              <div class="flex flex-wrap md:flex-nowrap justify-between border-b-2 border-slate-100 pb-4 mb-4 gap-2">
                <button type="button" class="feature-tab active text-[#E52F20] font-black text-sm md:text-[15px] border-b-2 border-[#E52F20] pb-2 -mb-[18px] transition-colors" data-target="tab-payment">الدفع عند الاستلام</button>
                <button type="button" class="feature-tab text-slate-500 font-bold text-sm md:text-[15px] hover:text-slate-800 transition-colors" data-target="tab-fast">توصيل سريع</button>
                <button type="button" class="feature-tab text-slate-500 font-bold text-sm md:text-[15px] hover:text-slate-800 transition-colors" data-target="tab-support">خدمة الزبائن</button>
                <button type="button" class="feature-tab text-slate-500 font-bold text-sm md:text-[15px] hover:text-slate-800 transition-colors" data-target="tab-check">تفقد المنتج</button>
              </div>

              <div id="tab-payment" class="tab-content flex flex-col items-center justify-center py-6 text-center">
                <svg class="w-24 h-24 text-[#E52F20] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <h2 class="text-3xl font-black text-slate-900">الدفع عند الاستلام</h2>
              </div>
              <div id="tab-fast" class="tab-content hidden flex flex-col items-center justify-center py-6 text-center">
                <svg class="w-24 h-24 text-[#E52F20] mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zm-9-1a2 2 0 1 1 4 0v1h-4V6zm8 13H6V9h2v2a1 1 0 0 0 2 0V9h4v2a1 1 0 0 0 2 0V9h2v10z"/></svg>
                <h2 class="text-3xl font-black text-slate-900">التوصيل السريع</h2>
                <p class="text-lg text-slate-600 font-bold mt-2">توصيل سريع الى 58 ولاية خلال 24 ساعة او 72 ساعة كحد اقصى و الدفع عند الاستلام</p>
              </div>
              <div id="tab-support" class="tab-content hidden flex flex-col items-center justify-center py-6 text-center">
                <svg class="w-24 h-24 text-[#E52F20] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                <h2 class="text-3xl font-black text-slate-900">خدمة الزبائن</h2>
                <p class="text-lg text-slate-600 font-bold mt-2">قبل و بعد البيع دائما في خدمتكم طوال الاسبوع من 9:00 صباحا الى 18:00 مساءا</p>
              </div>
              <div id="tab-check" class="tab-content hidden flex flex-col items-center justify-center py-6 text-center">
                <svg class="w-24 h-24 text-[#E52F20] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <h2 class="text-3xl font-black text-slate-900">تفقد الطرد</h2>
                <p class="text-lg text-slate-600 font-bold mt-2">في متجرنا، عندك الحق الكامل لتفقد المنتج قبل الدفع لكي تتأكد من (المنتج، المقاس، اللون، الجودة)</p>
              </div>
            </div>

            \${variantsHtml}

            <!-- ADD TO CART ROW -->
            <div class="flex items-center gap-4 mt-6">
              <button id="addScreenshotStyleBtn" type="button" class="flex-1 bg-[#E52F20] hover:bg-[#b01d12] text-white font-black text-xl py-4 rounded-md transition-colors shadow-lg shadow-red-500/30">اضغط هنا لتأكيد الطلب</button>
              
              <div class="flex items-center bg-gray-50 border border-gray-200 rounded-md shrink-0 h-[60px]">
                <button type="button" onclick="updateQty(1)" class="px-4 text-gray-500 hover:text-black font-black text-2xl h-full">+</button>
                <span id="expressQtyDisplay" class="w-8 text-center font-black text-xl">1</span>
                <input type="hidden" id="expressQty" value="1">
                <button type="button" onclick="updateQty(-1)" class="px-4 text-gray-500 hover:text-black font-black text-2xl h-full">-</button>
              </div>
            </div>

`;

const firstPart = content.substring(0, leftColStart);
const lastPart = content.substring(trustBadgesStart);

let newContent = firstPart + newLeftColumn + "\n" + lastPart;

// Now we need to remove the old features section that is at the bottom of the page
// because we moved it into tabs!
const oldFeaturesStart = newContent.indexOf('<!-- Features section -->');
if (oldFeaturesStart > -1) {
    const oldFeaturesEnd = newContent.indexOf('</section>', oldFeaturesStart) + 10;
    if (oldFeaturesEnd > 10) {
        newContent = newContent.substring(0, oldFeaturesStart) + newContent.substring(oldFeaturesEnd);
    }
}

// We need to add JS to handle the Tab clicks and the Add to Cart button
const scriptToAdd = `
    setTimeout(() => {
        // Handle Tabs
        const tabs = document.querySelectorAll('.feature-tab');
        const contents = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // reset all tabs
                tabs.forEach(t => {
                    t.classList.remove('active', 'text-[#E52F20]', 'border-[#E52F20]');
                    t.classList.add('text-slate-500', 'border-transparent');
                });
                // reset all contents
                contents.forEach(c => c.classList.add('hidden'));
                
                // activate clicked
                tab.classList.remove('text-slate-500', 'border-transparent');
                tab.classList.add('active', 'text-[#E52F20]', 'border-[#E52F20]');
                document.getElementById(tab.getAttribute('data-target')).classList.remove('hidden');
            });
        });

        // Handle Add to Cart Button
        const addBtn = document.getElementById('addScreenshotStyleBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (!PRODUCT_DATA) return;
                let variantLabel = null;
                if (PRODUCT_DATA.variants && PRODUCT_DATA.variants.length > 0) {
                    if (!SELECTED_VARIANT_ID) {
                        alert("الرجاء اختيار اللون/المقاس أولاً");
                        return;
                    }
                    const v = PRODUCT_DATA.variants.find(x => x.id === SELECTED_VARIANT_ID);
                    if (v) variantLabel = v.label;
                }
                
                // Add to cart global function from store2.js
                if (window.addToCart) {
                    window.addToCart(PRODUCT_DATA, QTY, SELECTED_VARIANT_ID, variantLabel);
                    // Open the cart drawer
                    if (window.openCart) window.openCart();
                }
            });
        }
    }, 100);
`;

// Insert the script at the end of loadProduct() or renderProduct()
// In product.html, it's rendered by JS, so we must add the event listeners AFTER `el.innerHTML = ...`
const insertPoint = newContent.indexOf('document.getElementById(\'expressVariantsBox\')');
if (insertPoint > -1) {
    newContent = newContent.substring(0, insertPoint) + scriptToAdd + "\n" + newContent.substring(insertPoint);
}

fs.writeFileSync("public/product.html", newContent, "utf8");
console.log("Refactored layout!");
