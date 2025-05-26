window.addEventListener('DOMContentLoaded', () => {
    // Header slide-down
    document.querySelector('header').style.transform = 'translateY(0)';
    // Fade-in cards
    document.querySelectorAll('.card').forEach((c,i) => {
      c.style.opacity = 0;
      setTimeout(()=> c.style.opacity = 1, 200 * i);
    });
  });
  