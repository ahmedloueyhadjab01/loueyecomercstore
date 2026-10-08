
(function() {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: 'var(--primary)',
            dark: 'var(--primary-dark)'
          },
          ink: '#0f172a',
          'sand-deep': '#f8fafc',
          forest: '#10b981',
          'forest-dark': '#059669',
          gold: '#f59e0b',
        }
      }
    }
  };

  function applySimpleTheme() {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.setProperty('--primary', '#E52F20');
    root.style.setProperty('--primary-dark', '#C42012');
    root.style.setProperty('--bg', '#f8fafc');
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--border', '#e2e8f0');
    root.style.setProperty('--text', '#0f172a');
    root.style.setProperty('--muted', '#64748b');
    
    if (document.body) {
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.backgroundImage = 'none';
        document.body.style.color = '#0f172a';
    }
  }

  // Apply immediately and on DOMContentLoaded
  applySimpleTheme();
  document.addEventListener('DOMContentLoaded', applySimpleTheme);
})();
