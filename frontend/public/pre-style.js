(function () {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? '#0c0a09' : '#fafaf9';
  document.documentElement.style.backgroundColor = theme;
})();
