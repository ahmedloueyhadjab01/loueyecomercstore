const fs = require("fs");

function updateFile(file) {
  let content = fs.readFileSync(file, "utf8");
  
  // 1. Replace the wrapper classes
  content = content.replace(
    /id="cartDrawer" class="fixed inset-0 bg-slate-900\/40 hidden z-50 flex justify-end backdrop-blur-sm transition-opacity"/g,
    'id="cartDrawer" class="fixed inset-0 bg-slate-900/40 hidden z-50 backdrop-blur-sm transition-opacity"'
  );
  
  // 2. Replace the drawer container classes
  // Note: we add fixed left-0 top-0 and change bg-white to bg-[#E52F20], translate-x-full to -translate-x-full
  content = content.replace(
    /class="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col translate-x-full transition-transform duration-300" id="cartDrawerContent"/g,
    'class="bg-[#E52F20] w-full max-w-sm h-full shadow-2xl flex flex-col fixed left-0 top-0 -translate-x-full transition-transform duration-300" id="cartDrawerContent"'
  );

  // 3. Update the header
  content = content.replace(
    /<div class="p-5 border-b border-slate-100 flex items-center justify-between bg-white">/g,
    '<div class="p-5 border-b border-[#cc2215] flex items-center justify-between bg-[#E52F20] text-white">'
  );
  
  // 4. Update the title text
  content = content.replace(
    /<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">/g,
    '<h2 class="text-xl font-bold text-white flex items-center gap-2">'
  );

  // 5. Update the icon
  content = content.replace(
    /<svg class="w-6 h-6 text-\[#E52F20\]"/g,
    '<svg class="w-6 h-6 text-white"'
  );

  // 6. Update the close button
  content = content.replace(
    /<button id="closeCart" class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100/g,
    '<button id="closeCart" class="p-2 text-white hover:bg-[#cc2215]'
  );

  // 7. Update the items list container
  content = content.replace(
    /<div id="cartItemsList" class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50"><\/div>/g,
    '<div id="cartItemsList" class="flex-1 overflow-y-auto p-5 space-y-4 bg-[#E52F20]"></div>'
  );

  // 8. Update the footer container
  content = content.replace(
    /<div class="p-5 border-t border-slate-100 bg-white">/g,
    '<div class="p-5 border-t border-[#cc2215] bg-[#E52F20]">'
  );

  // 9. Update the total label
  content = content.replace(
    /<span class="text-slate-500 font-semibold">/g,
    '<span class="text-red-100 font-semibold">'
  );

  // 10. Update the total price
  content = content.replace(
    /<span id="cartTotal" class="text-2xl font-bold text-slate-900">/g,
    '<span id="cartTotal" class="text-2xl font-bold text-white">'
  );

  // 11. Update the checkout button
  content = content.replace(
    /<button id="checkoutBtn" class="w-full bg-red-700 text-white/g,
    '<button id="checkoutBtn" class="w-full bg-white text-[#E52F20]'
  );

  fs.writeFileSync(file, content, "utf8");
  console.log("Updated", file);
}

updateFile("public/index.html");
updateFile("public/product.html");
