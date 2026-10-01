const fs = require("fs");
["public/index.html", "public/product.html"].forEach(file => {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(
    `btn.addEventListener('click', () => {
      const parent = btn.closest('.relative');
      const input = parent.querySelector('input');
      input.value = '';
      input.focus();
      loadProducts();
    // Missing closing brackets for forEach!
  }
});`,
    `btn.addEventListener('click', () => {
      const parent = btn.closest('.relative');
      const input = parent.querySelector('input');
      input.value = '';
      input.focus();
      loadProducts();
    });
  });`
  );
  fs.writeFileSync(file, html, "utf8");
});
console.log("Fixed mobile search syntax!");
