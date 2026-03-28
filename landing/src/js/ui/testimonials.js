/**
 * @param {HTMLElement | null} root
 */
export function initCarousel(root) {
  if (!root) return;

  const track = root.querySelector('[data-carousel-track]');
  const slides = root.querySelectorAll('[data-carousel-slide]');
  const trackId = track instanceof HTMLElement && track.id ? track.id : '';
  const prev = trackId
    ? document.querySelector(`[data-carousel-prev][aria-controls="${trackId}"]`)
    : root.querySelector('[data-carousel-prev]');
  const next = trackId
    ? document.querySelector(`[data-carousel-next][aria-controls="${trackId}"]`)
    : root.querySelector('[data-carousel-next]');
  const dotsHost = root.querySelector('[data-carousel-dots]');

  if (!track || slides.length === 0) return;

  let index = 0;
  const total = slides.length;

  function go(i) {
    index = ((i % total) + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  }

  function updateDots() {
    if (!dotsHost) return;
    dotsHost.querySelectorAll('button').forEach((btn, i) => {
      const on = i === index;
      btn.setAttribute('aria-current', on ? 'true' : 'false');
      btn.classList.toggle('bg-teal-600', on);
      btn.classList.toggle('bg-slate-300', !on);
    });
  }

  if (dotsHost && total > 0) {
    dotsHost.innerHTML = '';
    for (let i = 0; i < total; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'h-2 w-2 rounded-full bg-slate-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600';
      dot.setAttribute('aria-label', `Ir al elemento ${i + 1} de ${total}`);
      dot.addEventListener('click', () => go(i));
      dotsHost.appendChild(dot);
    }
    updateDots();
  }

  if (prev instanceof HTMLButtonElement) prev.addEventListener('click', () => go(index - 1));
  if (next instanceof HTMLButtonElement) next.addEventListener('click', () => go(index + 1));

  go(0);
}
