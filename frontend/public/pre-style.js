(function () {
  const saved = localStorage.getItem('theme');
  let dark;
  if (saved === 'light') {
    dark = false;
  } else if (saved === 'dark') {
    dark = true;
  } else {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.backgroundColor = dark ? '#0c0a09' : '#fafaf9';
})();
