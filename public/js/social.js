// يجلب روابط التواصل الاجتماعي من الإعدادات ويرسم أيقونات دائرية لكل رابط غير فارغ فقط
const SOCIAL_ICON_META = {
  social_whatsapp: { emoji: '💬', label: 'واتساب' },
  social_instagram: { emoji: '📸', label: 'انستغرام' },
  social_facebook: { emoji: '📘', label: 'فيسبوك' },
  social_tiktok: { emoji: '🎵', label: 'تيك توك' },
  social_telegram: { emoji: '✈️', label: 'تلغرام' },
};

function normalizeSocialUrl(key, value) {
  if (!value) return null;
  if (key === 'social_whatsapp') {
    // يقبل رقمًا دوليًا خامًا أو رابط wa.me كاملًا
    if (/^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/[^0-9]/g, '');
    return digits ? `https://wa.me/${digits}` : null;
  }
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

async function fetchSocialLinks() {
  try {
    const res = await fetch('/api/settings/social');
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

function renderSocialIcons(container, links, { size = 'w-10 h-10 text-lg' } = {}) {
  if (!container) return;
  const entries = Object.keys(SOCIAL_ICON_META)
    .map((key) => ({ key, url: normalizeSocialUrl(key, links[key]), ...SOCIAL_ICON_META[key] }))
    .filter((e) => e.url);

  if (!entries.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = entries
    .map(
      (e) => `
    <a href="${e.url}" target="_blank" rel="noopener" title="${e.label}"
       class="${size} rounded-full border-2 border-ink bg-white flex items-center justify-center hover:bg-forest hover:text-white hover:border-forest transition-colors">
      <span>${e.emoji}</span>
    </a>`
    )
    .join('');
}

async function initSocialIcons(containerId, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const links = await fetchSocialLinks();
  renderSocialIcons(container, links, opts);
}
