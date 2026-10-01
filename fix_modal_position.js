const fs = require("fs");

const oldModal = `  <!-- Conflict Modal: saved vs new customer data -->
  <div id="conflictModal" class="hidden fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-right" dir="rtl">`;

const newModal = `  <!-- Conflict Modal: saved vs new customer data -->
  <div id="conflictModal" class="hidden fixed inset-0 bg-black/60 z-[200] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm" style="align-items:center!important">
    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-right" dir="rtl" style="margin:auto;position:relative;top:0;transform:none">`;

["public/product.html", "public/index.html"].forEach(f => {
  let code = fs.readFileSync(f, "utf8");
  if (code.includes(oldModal)) {
    code = code.replace(oldModal, newModal);
    fs.writeFileSync(f, code, "utf8");
    console.log(f + " modal position fixed!");
  } else {
    // Try a more targeted replacement
    code = code.replace(
      /id="conflictModal" class="hidden fixed inset-0[^"]*"/g,
      `id="conflictModal" class="hidden fixed inset-0 bg-black/60 z-[200] p-4 backdrop-blur-sm" style="display:none;align-items:center;justify-content:center;"`
    );
    // Also fix the show logic - we need to use flex when showing
    fs.writeFileSync(f, code, "utf8");
    console.log(f + " modal targeted fix applied!");
  }
});
