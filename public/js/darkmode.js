const btn = document.getElementById('darkToggle');
btn.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  localStorage.light = document.documentElement.classList.contains('light');
});
// On load
if (localStorage.light === 'true') {
  document.documentElement.classList.add('light');
}
