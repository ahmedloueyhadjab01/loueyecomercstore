
    let PRODUCT_DATA = null;
    let SELECTED_VARIANT_ID = null;
    let QTY = 1;
    let EXPRESS_DELIVERY_TYPE = 'desk';
    let EXPRESS_SHIPPING_COST = 0;

    const escapeHtml = (unsafe) => {
      return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
    };

    const money = (num) => {
      return Number(num).toLocaleString('en-DZ');
    };
    
    function updateQty(change) {
       let newQty = QTY + change;
       if (newQty < 1) newQty = 1;
       QTY = newQty;
       const d = document.getElementById('expressQtyDisplay');
       const i = document.getElementById('expressQty');
       if(d) d.textContent = QTY;
       if(i) i.value = QTY;
    }
    
    function updateExpressVariant() {
       const checked = document.querySelector('input[name="expressVariant"]:checked');
       if (checked) {
          SELECTED_VARIANT_ID = parseInt(checked.value, 10);
          if (PRODUCT_DATA && PRODUCT_DATA.variants) {
             const variantObj = PRODUCT_DATA.variants.find(v => v.id === SELECTED_VARIANT_ID);
             if (variantObj && variantObj.image) {
                const mainImg = document.getElementById('expressMainImage');
                if (mainImg) {
                   mainImg.src = variantObj.image;
                }
             }
          }
       }
    }

    async function loadProduct() {
      const el = document.getElementById('productDetail');
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) throw new Error("No id");
        
        let storeId = params.get('store_id');
        if (!storeId && typeof CURRENT_STORE_ID !== 'undefined') storeId = CURRENT_STORE_ID;
        const q = storeId ? "?store_id=" + storeId : '';
        
        const res = await fetch('/api/products/' + id + q);
        if (!res.ok) throw new Error("Not found");
        const product = await res.json();
        PRODUCT_DATA = product;
        
        let variantsHtml = '';
        if (product.variants && product.variants.length > 0) {
           SELECTED_VARIANT_ID = product.variants[0].id;
           variantsHtml = `
             <div class="mb-5">
               <p class="block text-sm font-bold text-slate-700 mb-2">اختر المتغير (اللون/المقاس)</p>
               <div class="flex flex-wrap gap-2">
                 ${product.variants.map((v, idx) => `
                   <label class="cursor-pointer relative">
                     <input type="radio" name="expressVariant" value="${v.id}" class="peer hidden" ${idx===0?'checked':''} onchange="updateExpressVariant()">
                     <div class="px-4 py-2 border-2 border-slate-200 rounded-lg peer-checked:border-[#E52F20] peer-checked:bg-red-50 peer-checked:text-[#E52F20] font-bold text-sm text-slate-600 transition-colors">
                       ${escapeHtml(v.color || '')} ${escapeHtml(v.size || '')}
                     </div>
                   </label>
                 `).join('')}
               </div>
             </div>
           `;
        }

        const svgHand = `<svg class="w-8 h-8 text-[#E52F20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        const svgTruck = `<svg class="w-8 h-8 text-[#E52F20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>`;
        const svgCheck = `<svg class="w-8 h-8 text-[#E52F20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        const svgHeadset = `<svg class="w-8 h-8 text-[#E52F20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;

        el.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8 lg:gap-12">
          <!-- Right: Image -->
          <div class="w-full md:w-1/2 lg:w-5/12 shrink-0">
            <div class="sticky top-24">
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-zoom-in" onclick="if(window.openLightbox) window.openLightbox('${escapeHtml(product.image)}')">
                <img id="expressMainImage" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="w-full h-auto aspect-square object-cover hover:scale-105 transition-transform duration-500">
              </div>
            </div>
          </div>

          <!-- Left: Info & Form -->
          <div class="w-full md:w-1/2 lg:w-7/12">
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 mb-3">${escapeHtml(product.name)}</h1>
            <p class="text-2xl font-black text-[#E52F20] mb-4">${money(product.price)} <span class="text-base font-bold text-slate-500">منتج</span></p>
            ${product.description ? `\n<div class="mb-5 text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-right whitespace-pre-line">${escapeHtml(product.description)}</div>` : ''}

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
                
                ${variantsHtml}

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
            <div class="grid grid-cols-2 gap-3 mt-6">
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                ${svgHand}<span class="text-[13px] font-black text-slate-700 mt-1">الدفع عند الإستلام</span>
              </div>
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                ${svgTruck}<span class="text-[13px] font-black text-slate-700 mt-1">توصيل سريع 58 ولاية</span>
              </div>
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                ${svgCheck}<span class="text-[13px] font-black text-slate-700 mt-1">ضمان الجودة 100%</span>
              </div>
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                ${svgHeadset}<span class="text-[13px] font-black text-slate-700 mt-1">خدمة ما بعد البيع</span>
              </div>
            </div>
          </div>
        </div>
        `;
        initExpressForm();
        updateExpressVariant();
      } catch (err) {
        console.error(err); el.innerHTML = '<pre dir="ltr" style="text-align:left;color:red;padding:20px;">' + err.stack + '</pre>';
      }
    }

    async function loadSavedExpressCustomer() {
       try {
          const saved = localStorage.getItem('savedCustomer');
          if (!saved) return;
          const data = JSON.parse(saved);
          if (data.customer_name) {
            const nameEl = document.getElementById('expressName');
            if (nameEl) nameEl.value = data.customer_name;
          }
          if (data.phone) {
            const phoneEl = document.getElementById('expressPhone');
            if (phoneEl) phoneEl.value = data.phone;
          }
          if (data.address) {
            const addrEl = document.getElementById('expressAddress');
            if (addrEl) addrEl.value = data.address;
          }
          if (data.wilaya_code) {
             const wSelect = document.getElementById('expressWilaya');
             const cSelect = document.getElementById('expressCommune');
             const details = document.getElementById('expressWilayaDetails');
             if (wSelect) {
                // Set value AFTER loadWilayas has already populated options
                wSelect.value = String(data.wilaya_code);
                if (wSelect.value) {
                   // Show details section
                   if (details) details.classList.remove('hidden');
                   // Load communes
                   if (cSelect) {
                      cSelect.disabled = false;
                      await Locations.loadCommunes(data.wilaya_code, cSelect);
                      if (data.commune) cSelect.value = data.commune;
                   }
                   // Fetch and show shipping prices
                   try {
                      const subtotal = PRODUCT_DATA ? PRODUCT_DATA.price * QTY : 0;
                      const params = new URLSearchParams(window.location.search);
                      let storeId = params.get('store_id') || 2;
                      const q = '&store_id=' + storeId;
                      const [homeRes, deskRes] = await Promise.all([
                        fetch('/api/shipping/calculate-cost?wilaya_code=' + data.wilaya_code + '&delivery_type=home&subtotal=' + subtotal + q),
                        fetch('/api/shipping/calculate-cost?wilaya_code=' + data.wilaya_code + '&delivery_type=desk&subtotal=' + subtotal + q)
                      ]);
                      const homeData = await homeRes.json();
                      const deskData = await deskRes.json();
                      const homeEl = document.getElementById('expressPriceHome');
                      const deskEl = document.getElementById('expressPriceDesk');
                      if (homeEl) homeEl.textContent = homeData.price ? money(homeData.price) + ' د.ج' : '0 د.ج';
                      if (deskEl) deskEl.textContent = deskData.price ? money(deskData.price) + ' د.ج' : '0 د.ج';
                      EXPRESS_SHIPPING_COST = (EXPRESS_DELIVERY_TYPE === 'desk' ? deskData.price : homeData.price) || 0;
                   } catch(e) {
                      const rate = typeof Locations !== 'undefined' ? Locations.getRate(data.wilaya_code) : null;
                      if (rate) {
                        const homeEl = document.getElementById('expressPriceHome');
                        const deskEl = document.getElementById('expressPriceDesk');
                        if (homeEl) homeEl.textContent = money(rate.home_price) + ' د.ج';
                        if (deskEl) deskEl.textContent = money(rate.desk_price) + ' د.ج';
                        EXPRESS_SHIPPING_COST = EXPRESS_DELIVERY_TYPE === 'desk' ? rate.desk_price : rate.home_price;
                      }
                   }
                }
             }
          }
       } catch(e) { console.error('loadSavedExpressCustomer error:', e); }
    }

    function initExpressForm() {
       const wilaya = document.getElementById('expressWilaya');
       const commune = document.getElementById('expressCommune');
       const details = document.getElementById('expressWilayaDetails');
       
       if (typeof Locations !== 'undefined' && wilaya) {
         Locations.loadWilayas(wilaya);
         const form = document.getElementById('expressForm');
         if (form) {
            form.addEventListener('submit', submitExpressOrder);
         }
         // Wire up qty buttons
         const minusBtn = document.getElementById('qtyMinus');
         const plusBtn = document.getElementById('qtyPlus');
         if (minusBtn) minusBtn.addEventListener('click', () => updateQty(-1));
         if (plusBtn) plusBtn.addEventListener('click', () => updateQty(1));
         // Wire up add-to-cart button
         const addBtn = document.getElementById('addToCartExpressBtn');
         if (addBtn) addBtn.addEventListener('click', addToCartExpress);
         
         loadSavedExpressCustomer();

         wilaya.addEventListener('change', async () => {
           if (!wilaya.value) {
             details.classList.add('hidden');
             return;
           }
           details.classList.remove('hidden');
           Locations.loadCommunes(wilaya.value, commune);
           
           document.getElementById('expressPriceHome').textContent = '...';
           document.getElementById('expressPriceDesk').textContent = '...';
           
           try {
             const subtotal = PRODUCT_DATA.price * QTY;
             const params = new URLSearchParams(window.location.search);
             let storeId = params.get('store_id');
             if (!storeId && typeof CURRENT_STORE_ID !== 'undefined') storeId = CURRENT_STORE_ID;
             if (!storeId) storeId = 2; // Default fallback
             const q = '&store_id=' + storeId;

             let hPrice = 0;
             let dPrice = 0;
             try {
                const homeRes = await fetch('/api/shipping/calculate-cost?wilaya_code=' + wilaya.value + '&delivery_type=home&subtotal=' + subtotal + q);
                const deskRes = await fetch('/api/shipping/calculate-cost?wilaya_code=' + wilaya.value + '&delivery_type=desk&subtotal=' + subtotal + q);
                const homeData = await homeRes.json();
                const deskData = await deskRes.json();
                hPrice = homeData.price;
                dPrice = deskData.price;
             } catch(e) {}

             if(!hPrice || !dPrice) {
                const rate = typeof Locations !== 'undefined' ? Locations.getRate(wilaya.value) : null;
                if(rate) {
                   hPrice = rate.home_price;
                   dPrice = rate.desk_price;
                }
             }
             
             document.getElementById('expressPriceHome').textContent = hPrice ? money(hPrice) + ' د.ج' : '0 د.ج';
             document.getElementById('expressPriceDesk').textContent = dPrice ? money(dPrice) + ' د.ج' : '0 د.ج';
             
             const activeData = EXPRESS_DELIVERY_TYPE === 'desk' ? dPrice : hPrice;
             EXPRESS_SHIPPING_COST = activeData || 0;
           } catch (e) {
             console.error(e);
           }
         });
       }

       document.querySelectorAll('.express-delivery-option').forEach(label => {
         label.addEventListener('click', () => {
           document.querySelectorAll('.express-delivery-option').forEach(l => {
             l.classList.remove('border-[#E52F20]', 'bg-red-50');
             l.classList.add('border-slate-200');
           });
           label.classList.remove('border-slate-200');
           label.classList.add('border-[#E52F20]', 'bg-red-50');
           label.querySelector('input').checked = true;
           EXPRESS_DELIVERY_TYPE = label.dataset.type;
           const priceText = label.querySelector('span[id^="expressPrice"]').textContent;
           EXPRESS_SHIPPING_COST = parseInt(priceText.replace(/\D/g,'')) || 0;
         });
       });
    }

    function addToCartExpress() {
      if(!PRODUCT_DATA) return;
      const variantObj = (PRODUCT_DATA.variants && SELECTED_VARIANT_ID) ? PRODUCT_DATA.variants.find(v => v.id === SELECTED_VARIANT_ID) : null;
      Cart.add(PRODUCT_DATA, QTY, variantObj);
      if(window.openCart) window.openCart();
    }

    async function submitExpressOrder(e) {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      
      // Conflict detection: check if current data differs from saved
      const saved = (() => { try { const s = localStorage.getItem('savedCustomer'); return s ? JSON.parse(s) : null; } catch(e){ return null; }})();
      const currentPhone = document.getElementById('expressPhone').value.trim();
      const currentWilaya = parseInt(document.getElementById('expressWilaya').value, 10);
      const currentAddress = document.getElementById('expressAddress').value.trim();
      
      const phoneChanged = saved && saved.phone && currentPhone && saved.phone !== currentPhone;
      const wilayaChanged = saved && saved.wilaya_code && currentWilaya && parseInt(saved.wilaya_code, 10) !== currentWilaya;
      const addressChanged = saved && saved.address && currentAddress && saved.address !== currentAddress;

      if (phoneChanged || wilayaChanged || addressChanged) {
        // Show conflict modal
        const modal = document.getElementById('conflictModal');
        
        const wilayaNameOld = typeof Locations !== 'undefined' ? (Locations.getWilayaName(saved.wilaya_code) || saved.wilaya_code) : saved.wilaya_code;
        const wilayaNameNew = typeof Locations !== 'undefined' ? (Locations.getWilayaName(currentWilaya) || currentWilaya) : currentWilaya;

        document.getElementById('conflictOldBox').innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">📦 بيانات طلب سابق</span>' + (saved.customer_name || '—') + ' — ' + (saved.phone || '—') + '<br>ولاية ' + wilayaNameOld + ' — ' + (saved.address || '');
        document.getElementById('conflictNewBox').innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">✏️ البيانات الجديدة التي أدخلتها</span>' + ((document.getElementById('expressName').value) || '—') + ' — ' + (currentPhone || '—') + '<br>ولاية ' + wilayaNameNew + ' — ' + currentAddress;
        
        modal.style.display = 'flex';
        // Wait for user choice
        await new Promise(resolve => {
          document.getElementById('conflictUseOld').onclick = () => {
            // Restore old data into form
            document.getElementById('expressName').value = saved.customer_name || '';
            document.getElementById('expressPhone').value = saved.phone || '';
            document.getElementById('expressAddress').value = saved.address || '';
            const wSelect = document.getElementById('expressWilaya');
            if (wSelect) {
               wSelect.value = saved.wilaya_code;
               wSelect.dispatchEvent(new Event('change'));
            }
            const cSelect = document.getElementById('expressCommune');
            if (cSelect && saved.commune) {
               setTimeout(() => { cSelect.value = saved.commune; }, 300);
            }
            modal.style.display = 'none';
            resolve();
          };
          document.getElementById('conflictUseNew').onclick = () => {
            modal.style.display = 'none';
            resolve();
          };
        });
      }
      
      const originalText = btn.textContent;
      btn.textContent = 'جاري الإرسال...';
      btn.disabled = true;

      const items = [{
         id: PRODUCT_DATA.id,
         user_id: PRODUCT_DATA.user_id,
         variant_id: SELECTED_VARIANT_ID,
         qty: QTY,
         price: PRODUCT_DATA.price,
         name: PRODUCT_DATA.name,
         image: PRODUCT_DATA.image
      }];
      
      const params = new URLSearchParams(window.location.search);
      let storeId = params.get('store_id');
      if (!storeId && typeof CURRENT_STORE_ID !== 'undefined') storeId = CURRENT_STORE_ID;

      const orderData = {
         customer_name: document.getElementById('expressName').value,
         phone: document.getElementById('expressPhone').value,
         address: document.getElementById('expressAddress').value,
         wilaya_code: parseInt(document.getElementById('expressWilaya').value, 10),
         commune: document.getElementById('expressCommune').value,
         delivery_type: EXPRESS_DELIVERY_TYPE,
         shipping_cost: EXPRESS_SHIPPING_COST,
         store_id: parseInt(storeId, 10),
         items: items
      };

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        
        if (data.success || data.order_id) {
           localStorage.setItem('savedCustomer', JSON.stringify({
              customer_name: orderData.customer_name,
              phone: orderData.phone,
              address: orderData.address,
              wilaya_code: orderData.wilaya_code,
              commune: orderData.commune
           }));
           alert('تم تأكيد طلبك بنجاح! رقم الطلب: ' + data.order_id);
           window.location.href = '/';
        } else {
           alert('حدث خطأ: ' + (data.error || 'يرجى المحاولة مجددا'));
           btn.textContent = originalText;
           btn.disabled = false;
        }
      } catch (err) {
         alert('خطأ في الاتصال');
         btn.textContent = originalText;
         btn.disabled = false;
      }
    }

    document.addEventListener("DOMContentLoaded", loadProduct);
  
</main>

  
  
  

  <!-- Features -->
  <div class="max-w-5xl mx-auto px-4 py-16 mb-10 border-t border-slate-100">
    <div class="text-center mb-12">
      <h2 class="text-2xl md:text-3xl font-black text-slate-900">لماذا نعتبر الأفضل</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8 text-center">
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-[#E52F20] rounded-full flex items-center justify-center text-white mb-4 shadow-lg"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
        <h3 class="text-lg font-black text-[#E52F20] mb-2">الدفع</h3>
        <p class="text-sm text-slate-500 font-bold">الدفع عند الاستلام</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-[#E52F20] rounded-full flex items-center justify-center text-white mb-4 shadow-lg"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg></div>
        <h3 class="text-lg font-black text-[#E52F20] mb-2">مركز المساعدة</h3>
        <p class="text-sm text-slate-500 font-bold">دعم على مدار الساعة لةجربة تسوق ممتعة.</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-[#E52F20] rounded-full flex items-center justify-center text-white mb-4 shadow-lg"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
        <h3 class="text-lg font-black text-[#E52F20] mb-2">الضمان</h3>
        <p class="text-sm text-slate-500 font-bold">البيع بالضمان غايتنا</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-[#E52F20] rounded-full flex items-center justify-center text-white mb-4 shadow-lg"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg></div>
        <h3 class="text-lg font-black text-[#E52F20] mb-2">الجودة</h3>
        <p class="text-sm text-slate-500 font-bold">منتجات ُذو جودة عاليا </p>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-[#E52F20] rounded-full flex items-center justify-center text-white mb-4 shadow-lg"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>
        <h3 class="text-lg font-black text-[#E52F20] mb-2">التخزين</h3>
        <p class="text-sm text-slate-500 font-bold">التخزين�� في مستودعات عالية الجودة وتحترم شروط السلامد بامتياز</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-[#E52F20] rounded-full flex items-center justify-center text-white mb-4 shadow-lg"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></div>
        <h3 class="text-lg font-black text-[#E52F20] mb-2">التوصيل</h3>
        <p class="text-sm text-slate-500 font-bold">التوصيل سريع والى 58 ولاية</p>
      </div>
    </div>
  </div>




  <!-- السلة (Drawer) -->
  <div id="cartDrawer" class="fixed inset-0 bg-slate-900/40 hidden z-50 backdrop-blur-sm transition-opacity">
    <div class="bg-[#E52F20] w-full max-w-sm h-full shadow-2xl flex flex-col fixed left-0 top-0 -translate-x-full transition-transform duration-300" id="cartDrawerContent">
      <div class="p-5 border-b border-[#cc2215] flex items-center justify-between bg-[#E52F20] text-white">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          سلة التسوق
        </h2>
        <button id="closeCart" class="p-2 text-white hover:bg-[#cc2215] rounded-full transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
      </div>
      <div id="cartItemsList" class="flex-1 overflow-y-auto p-5 space-y-4 bg-[#E52F20]"></div>
      <div class="p-5 border-t border-[#cc2215] bg-[#E52F20]">
        <div class="flex justify-between items-center mb-4">
          <span class="text-red-100 font-semibold">المجموع</span>
          <span id="cartTotal" class="text-2xl font-bold text-white">0 د.ج</span>
        </div>
        <button id="checkoutBtn" class="w-full bg-white text-[#E52F20] font-bold py-4 rounded-2xl hover:bg-red-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base">إتمام الطلب</button>
      </div>
    </div>
  </div>

  <!-- نموذج إتمام الطلب (Checkout Sheet on Mobile) -->
  <div id="checkoutOverlay" class="fixed inset-0 bg-slate-900/60 hidden z-50 flex items-end sm:items-center justify-center backdrop-blur-sm p-0 sm:p-4 overflow-hidden">
    <div class="checkout-modal rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto transform translate-y-full transition-transform duration-300" id="checkoutModalContent">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900">معلومات التوصيل</h2>
        <button id="cancelCheckoutHeader" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
      </div>
      <form id="checkoutForm" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">الاسم الكامل <span class="text-red-500">*</span></label>
          <input type="text" id="custName" required class="input-field" placeholder="مثال: محمد الأمين" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">رقم الهاتف <span class="text-red-500">*</span></label>
          <input type="tel" id="custPhone" required class="input-field text-left" dir="ltr" placeholder="0555 55 55 55" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">الولاية <span class="text-red-500">*</span></label>
          <select id="custWilaya" required class="input-field bg-white">
            <option value="">-- اختر الولاية --</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">البلدية / العنوان <span class="text-red-500">*</span></label>
          <select id="custCommune" required class="input-field bg-white mb-3">
            <option value="">-- اختر البلدية --</option>
          </select>
          <input type="text" id="custAddress" required class="input-field" placeholder="الحي، الشارع..." />
        </div>
        
        <div id="shippingOptionsBox" class="hidden mt-4 pt-4 border-t border-slate-100">
          <p class="block text-sm font-semibold text-slate-700 mb-3">طريقة التوصيل <span class="text-red-500">*</span></p>
          <div class="space-y-2">
            <label id="labelShipHome" class="delivery-option flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" data-type="home">
              <input type="radio" name="shipType" value="home" id="shipHome" class="w-4 h-4 text-[#E52F20] focus:ring-red-500" />
              <div class="flex-1 flex justify-between items-center">
                <span class="text-sm font-semibold text-slate-800">توصيل للمنزل</span>
                <span id="priceHome" class="delivery-price text-sm font-bold text-[#E52F20]">--</span>
              </div>
            </label>
            <label id="labelShipDesk" class="delivery-option flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" data-type="desk">
              <input type="radio" name="shipType" value="desk" id="shipDesk" class="w-4 h-4 text-[#E52F20] focus:ring-red-500" />
              <div class="flex-1 flex justify-between items-center">
                <span class="text-sm font-semibold text-slate-800">توصيل للمكتب (StopDesk)</span>
                <span id="priceDesk" class="delivery-price text-sm font-bold text-[#E52F20]">--</span>
              </div>
            </label>
          </div>
        </div>

        <div class="flex gap-3 pt-6">
          <button type="submit" id="confirmOrderBtn" class="flex-1 bg-red-700 text-white font-bold py-4 rounded-2xl hover:bg-red-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-base">تأكيد الطلب الآن</button>
          <button type="button" id="cancelCheckout" class="px-5 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-colors">إلغاء</button>
        </div>
      </form>
    </div>
  </div>

  <div id="successToast" class="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl transition-all z-50 hidden flex items-center gap-2">
    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    <span id="successToastMsg"></span>
  </div>

  <!-- شريط التنقل السفلي للهاتف -->
  
  <!-- التذييل (Footer) -->
  <footer class="bg-white border-t border-slate-100 pt-12 pb-24 md:pb-12 mt-16">
    <div class="max-w-6xl mx-auto px-4">
      
      <!-- Logo -->
      <div class="flex justify-center mb-10">
        <a href="/" class="flex flex-col items-center">
           <span class="text-4xl font-black text-[#E52F20] tracking-tighter" style="font-family: Impact, sans-serif;">OVARO<span class="text-[#f59e0b]">28</span></span>
           <span class="text-[9px] tracking-[0.2em] text-[#E52F20] border-t border-[#E52F20] mt-1 pt-1">W W W . O V A R O 2 8 . C O M</span>
        </a>
      </div>
      
      <div class="w-full h-px bg-slate-100 mb-10"></div>
      
      <!-- 3 Columns -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" dir="rtl">
        
        <!-- Column 1 -->
        <div class="flex flex-col items-center">
          <h3 class="text-[#E52F20] font-bold text-lg mb-2">عن المتجر</h3>
          <div class="w-8 h-0.5 bg-[#E52F20] mb-4"></div>
          <ul class="flex flex-col gap-3">
            <li><a href="/about-us.html" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">عن المتجر</a></li>
            <li><a href="/payment-methods.html" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">طرق الدفع</a></li>
            <li><a href="/shipping-delivery.html" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">الشحن والتسليم</a></li>
          </ul>
        </div>
        
        <!-- Column 2 -->
        <div class="flex flex-col items-center">
          <h3 class="text-[#E52F20] font-bold text-lg mb-2">اتصل بنا</h3>
          <div class="w-8 h-0.5 bg-[#E52F20] mb-4"></div>
          <ul class="flex flex-col gap-3">
            <li><a href="/contact-us.html" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">اتصل بنا</a></li>
            <li><a href="#" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">الأسئلة المتكررة</a></li>
          </ul>
        </div>
        
        <!-- Column 3 -->
        <div class="flex flex-col items-center">
          <h3 class="text-[#E52F20] font-bold text-lg mb-2">الشروط والسياسات</h3>
          <div class="w-8 h-0.5 bg-[#E52F20] mb-4"></div>
          <ul class="flex flex-col gap-3">
            <li><a href="/terms.html" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">شروط الاستخدام</a></li>
            <li><a href="/return-policy.html" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">سياسة الاستبدال والاسترجاع</a></li>
            <li><a href="/privacy-policy.html" class="text-[#E52F20]/80 hover:text-[#E52F20] text-sm font-medium transition-colors">سياسة الخصوصية</a></li>
          </ul>
        </div>
        
      </div>
      
      <div class="w-full h-px bg-slate-100 my-10"></div>
      
      <!-- Social Media -->
      <div class="flex justify-center gap-4">
        <a id="social-instagram" href="#" class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a id="social-facebook" href="#" class="w-10 h-10 rounded-full bg-[#3b5998] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
        </a>
      </div>
      
    </div>
  </footer>

  <nav class="md:hidden bottom-nav fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
    <a href="/" class="nav-item active">
      <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
      <span class="nav-label">الرئيسية</span>
    </a>
    <button id="mobileNavSearch" class="nav-item">
      <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      <span class="nav-label">بحث</span>
    </button>
    <button id="mobileNavCart" class="nav-item">
      <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      <span class="nav-label">السلة</span>
      <span id="bottomCartCount" class="absolute top-2 right-4 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">0</span>
    </button>
  </nav>

  <script src="/js/cart.js?v=1790386050867">
  <script src="/js/social.js?v=1790328576721">
  <script src="/js/locations.js?v=1790328525707">
  <script src="/js/store2.js?v=1790418518948">
  <script>
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
    // Set up event listeners for CSP

    // Extra CSP listeners
    const dSearch = document.getElementById('desktopSearchBtn');
    const mSearch = document.getElementById('mobileNavSearch');
    [dSearch, mSearch].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const el = document.getElementById('attachedSearchBarContainer');
          if (!el) { console.error('attachedSearchBarContainer not found!'); return; }
          el.classList.toggle('hidden');
          if(!el.classList.contains('hidden')) {
             const inp = document.getElementById('attachedSearchInput');
             if (inp) inp.focus();
          }
        });
      }
    });
    const dCart = document.getElementById('cartBtnDesktop');
    if (dCart) dCart.addEventListener('click', () => { if(window.openCart) window.openCart(); });
    
    const dForm = document.getElementById('attachedSearchForm');
    if (dForm) {
      dForm.addEventListener('submit', (e) => {
         e.preventDefault();
         const v = document.getElementById('attachedSearchInput').value;
         if(v) {
            const url = new URL(window.location.origin + '/');
            url.searchParams.set('q', v);
            const currentParams = new URLSearchParams(window.location.search);
            if (currentParams.has('store_slug')) url.searchParams.set('store_slug', currentParams.get('store_slug'));
            if (currentParams.has('store_id')) url.searchParams.set('store_id', currentParams.get('store_id'));
            window.location.href = url.toString();
         }
      });
    }
    
    const pBtn = document.getElementById('sliderPrevBtn');
    if (pBtn) pBtn.addEventListener('click', () => { if(window.prevSlide) window.prevSlide(); });
    
    const nBtn = document.getElementById('sliderNextBtn');
    if (nBtn) nBtn.addEventListener('click', () => { if(window.nextSlide) window.nextSlide(true); });
    
    document.querySelectorAll('.slider-dot').forEach(dot => {
       dot.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'));
          if(!isNaN(idx) && window.goToSlide) window.goToSlide(idx);
       });
    });

    
    // منح النقر على بطاقات المنتجات بطريقة event delegation (بدلاً من onclick inline)
    document.getElementById('productsGrid')?.addEventListener('click', (e) => {
      const card = e.target.closest('[data-prod-url]');
      if (card) {
        window.location.href = card.getAttribute('data-prod-url');
      }
    });

    document.getElementById('mobileNavCart').addEventListener('click', () => {
      window.openCart();
    });
  