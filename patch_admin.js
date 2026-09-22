const fs = require('fs');
let html = fs.readFileSync('public/admin.html', 'utf8');

// 1. Remove tailwind config that defines old colors
html = html.replace(/<script>[\s\S]*?tailwind\.config[\s\S]*?<\/script>/, '');

// 2. Replace custom fonts if any
html = html.replace(/font-display/g, '');

// 3. Class mappings
const mappings = {
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
  'border-b-2': 'border-b',
  'border-b-4': 'border-b',
  'shadow-\\[4px_4px_0px_#17241F\\]': 'shadow-sm',
  'shadow-\\[-4px_4px_0px_#17241F\\]': 'shadow-sm',
  'shadow-\\[4px_4px_0px_#1E6F54\\]': 'shadow-sm',
  'shadow-\\[2px_2px_0px_#17241F\\]': 'shadow-sm',
  'bg-forest': 'bg-blue-600',
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

// Special fixes for buttons
// We want hover transitions to be smooth
html = html.replace(/transition-all/g, 'transition-all duration-300');
html = html.replace(/duration-300 duration-300/g, 'duration-300');

fs.writeFileSync('public/admin.html', html);
console.log("admin.html patched");
