
    let PRODUCT_DATA = null;
    let SELECTED_VARIANT_ID = null;
    let QTY = 1;
    let EXPRESS_DELIVERY_TYPE = 'desk';
    let EXPRESS_SHIPPING_COST = 0;

    
        
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
        const slug = params.get('slug');
        if (!id && !slug) throw new Error("لم يتم تحديد المنتج");
        
        let storeId = params.get('store_id');
        if (!storeId && typeof CURRENT_STORE_ID !== 'undefined') storeId = CURRENT_STORE_ID;
        const q = storeId ? "?store_id=" + storeId : '';
        
        let product;
        if (id) {
            const res = await fetch('/api/products/' + id + q);
            if (!res.ok) throw new Error("المنتج غير موجود");
            product = await res.json();
        } else {
            const qStr = storeId ? "?store_id=" + storeId + "&slug=" + encodeURIComponent(slug) : "?slug=" + encodeURIComponent(slug);
            const res = await fetch('/api/products' + qStr);
            if (!res.ok) throw new Error("المنتج غير موجود");
            const arr = await res.json();
            if (!arr || arr.length === 0) throw new Error("المنتج غير موجود");
            product = arr[0];
        }
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
  