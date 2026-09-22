const fs = require('fs');
let code = fs.readFileSync('public/admin.html', 'utf8');

const targetHtml = `<label class="text-xs font-bold text-slate-900/70 block mb-1">API Token / Secret (أو Token)</label>
                  <input type="password" name="api_token" placeholder="الرمز السري الخاص بالمتجر" class="field w-full p-2.5 text-xs sm:text-sm font-mono font-bold" />
                </div>
              </div>`;

const newHtml = `<label class="text-xs font-bold text-slate-900/70 block mb-1">API Token / Secret (أو Token)</label>
                  <input type="password" name="api_token" placeholder="الرمز السري الخاص بالمتجر" class="field w-full p-2.5 text-xs sm:text-sm font-mono font-bold" />
                </div>
              </div>
              
              <div class="mt-4">
                <label class="text-xs font-bold text-slate-900/70 block mb-1">اسم شركة التوصيل الافتراضية (يظهر في ملصق الشحن Bon بغض النظر عن استخدام API أم لا)</label>
                <input type="text" name="manual_provider_name" placeholder="مثال: Yalidine Express, ZR Express, Mayestro..." class="field w-full p-2.5 text-xs sm:text-sm font-bold" />
              </div>`;

code = code.replace(targetHtml, newHtml);
fs.writeFileSync('public/admin.html', code);
console.log('Added manual_provider_name field');
