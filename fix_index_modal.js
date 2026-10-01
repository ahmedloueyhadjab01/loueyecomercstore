const fs = require("fs");
let html = fs.readFileSync("public/index.html", "utf8");

const conflictModal = `
  <!-- Conflict Modal: saved vs new customer data -->
  <div id="conflictModal" class="hidden fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-right" dir="rtl">
      <h3 class="text-lg font-black text-slate-900 mb-2">اكتشفنا اختلافاً في بياناتك!</h3>
      <p class="text-sm text-slate-500 font-bold mb-5">يبدو أن المعلومات التي أدخلتها مختلفة عن طلب سابق. أي بيانات تريد استخدامها؟</p>
      <div class="space-y-3 mb-5">
        <div id="conflictOldBox" class="p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-700"></div>
        <div id="conflictNewBox" class="p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-700"></div>
      </div>
      <div class="flex gap-3">
        <button id="conflictUseOld" class="flex-1 py-3 rounded-xl bg-slate-100 text-slate-800 font-black text-sm hover:bg-slate-200 transition-colors">استخدم القديمة</button>
        <button id="conflictUseNew" class="flex-1 py-3 rounded-xl bg-[#E52F20] text-white font-black text-sm hover:bg-[#b01d12] transition-colors">استخدم الجديدة</button>
      </div>
    </div>
  </div>
`;

html = html.replace("  </main>", conflictModal + "\n  </main>");
fs.writeFileSync("public/index.html", html, "utf8");
console.log("index.html conflict modal added!");
