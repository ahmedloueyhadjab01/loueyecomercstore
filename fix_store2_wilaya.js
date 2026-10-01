const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

const oldFn = `async function loadSavedCustomer() {
    try {
      const saved = localStorage.getItem('savedCustomer');
      if (!saved) return;
      const data = JSON.parse(saved);
      const form = document.getElementById('checkoutForm');
      if (form) {
        if (data.customer_name) form.customer_name.value = data.customer_name;
        if (data.phone) form.phone.value = data.phone;
        if (data.address) form.address.value = data.address;
        const wSelect = document.getElementById('custWilaya');
        const cSelect = document.getElementById('custCommune');
        if (wSelect && data.wilaya_code) {
          wSelect.value = data.wilaya_code;
          if (cSelect) {
            cSelect.disabled = false;
            await Locations.loadCommunes(data.wilaya_code, cSelect);
            if (data.commune) cSelect.value = data.commune;
          }
        }
      }
    } catch (e) {}
  }`;

const newFn = `async function loadSavedCustomer() {
    try {
      const saved = localStorage.getItem('savedCustomer');
      if (!saved) return;
      const data = JSON.parse(saved);
      const form = document.getElementById('checkoutForm');
      if (form) {
        if (data.customer_name) form.customer_name.value = data.customer_name;
        if (data.phone) form.phone.value = data.phone;
        if (data.address) form.address.value = data.address;
        const wSelect = document.getElementById('custWilaya');
        const cSelect = document.getElementById('custCommune');
        if (wSelect && data.wilaya_code) {
          // loadWilayas is synchronous so options are already populated
          wSelect.value = String(data.wilaya_code);
          if (wSelect.value) {
            // Load communes
            if (cSelect) {
              cSelect.disabled = false;
              await Locations.loadCommunes(data.wilaya_code, cSelect);
              if (data.commune) cSelect.value = data.commune;
            }
            // Trigger shipping price calculation
            await updateDeliveryPrices();
          }
        }
      }
    } catch (e) { console.error('loadSavedCustomer error:', e); }
  }`;

code = code.replace(oldFn, newFn);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("store2.js wilaya fix applied!");
