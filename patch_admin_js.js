const fs = require('fs');
let html = fs.readFileSync('public/js/admin.js', 'utf8');

const mappings = {
  'bg-sand-deep': 'bg-slate-100',
  'bg-sand': 'bg-slate-50',
  'text-ink': 'text-slate-900',
  'text-ink/': 'text-slate-900/',
  'bg-ink': 'bg-slate-900',
  'bg-ink/': 'bg-slate-900/',
  'border-ink': 'border-slate-200',
  'border-ink/': 'border-slate-200/',
  'border-2': 'border',
  'border-3': 'border',
  'border-4': 'border',
  'shadow-\\[4px_4px_0px_#17241F\\]': 'shadow-sm',
  'shadow-\\[-4px_4px_0px_#17241F\\]': 'shadow-sm',
  'shadow-\\[4px_4px_0px_#1E6F54\\]': 'shadow-sm',
  'shadow-\\[2px_2px_0px_#17241F\\]': 'shadow-sm',
  'bg-forest': 'bg-blue-600',
  'text-forest-dark': 'text-blue-700',
  'text-forest': 'text-blue-600',
  'border-forest': 'border-blue-600',
  'hover:bg-forest/90': 'hover:bg-blue-700',
  'bg-forest/10': 'bg-blue-50',
  'bg-terracotta': 'bg-blue-500',
  'text-terracotta': 'text-blue-500',
  'border-terracotta': 'border-blue-500',
  'hover:bg-terracotta/90': 'hover:bg-blue-600',
  'bg-terracotta/10': 'bg-blue-50',
  'bg-gold': 'bg-yellow-500',
  'text-gold': 'text-yellow-600',
  'rounded-3xl': 'rounded-2xl',
};

for (const [oldClass, newClass] of Object.entries(mappings)) {
  html = html.split(oldClass).join(newClass);
}

fs.writeFileSync('public/js/admin.js', html);
console.log("admin.js patched");
