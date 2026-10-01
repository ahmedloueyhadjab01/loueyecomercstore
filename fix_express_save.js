const fs = require("fs");
let code = fs.readFileSync("public/product.html", "utf8");

const saveCode = `
          if (data.success || data.order_id) {
             localStorage.setItem('savedCustomer', JSON.stringify({
                customer_name: orderData.customer_name,
                phone: orderData.phone,
                address: orderData.address,
                wilaya_code: orderData.wilaya_code,
                commune: orderData.commune
             }));`;
code = code.replace("if (data.success) {", saveCode);
code = code.replace("if (data.order_id) {", saveCode); // Just in case

const loadCode = `
      async function loadSavedExpressCustomer() {
         try {
            const saved = localStorage.getItem('savedCustomer');
            if (!saved) return;
            const data = JSON.parse(saved);
            const wSelect = document.getElementById('expressWilaya');
            const cSelect = document.getElementById('expressCommune');
            if (data.customer_name) document.getElementById('expressName').value = data.customer_name;
            if (data.phone) document.getElementById('expressPhone').value = data.phone;
            if (data.address) document.getElementById('expressAddress').value = data.address;
            if (wSelect && data.wilaya_code) {
               wSelect.value = data.wilaya_code;
               document.getElementById('expressWilayaDetails').classList.remove('hidden');
               if (cSelect) {
                  cSelect.disabled = false;
                  await Locations.loadCommunes(data.wilaya_code, cSelect);
                  if (data.commune) cSelect.value = data.commune;
               }
            }
         } catch(e) {}
      }
`;

code = code.replace(
  `let EXPRESS_DELIVERY_TYPE = 'desk';`,
  loadCode + `\n      let EXPRESS_DELIVERY_TYPE = 'desk';`
);

code = code.replace(
  `form.addEventListener('submit', submitExpressOrder);
          }`,
  `form.addEventListener('submit', submitExpressOrder);
          }
          loadSavedExpressCustomer();`
);

fs.writeFileSync("public/product.html", code, "utf8");
console.log("Express customer save added!");
