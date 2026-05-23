(function () {
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = saved === 'dark' || (!saved && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.backgroundColor = isDark ? '#0c0a09' : '#fafaf9';
})();
