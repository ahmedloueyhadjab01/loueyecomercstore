const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

const saveCode = `
    localStorage.setItem('savedCustomer', JSON.stringify({
      customer_name: payload.customer_name,
      phone: payload.phone,
      address: payload.address,
      wilaya_code: payload.wilaya_code,
      commune: payload.commune
    }));
    Cart.clear();`;
code = code.replace("Cart.clear();", saveCode);

const loadCode = `
async function loadSavedCustomer() {
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
}
loadSavedCustomer();
`;

code = code.replace(
  `// ---------- إتمام الطلب ----------`,
  loadCode + `\n// ---------- إتمام الطلب ----------`
);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Customer save added to store2.js!");
