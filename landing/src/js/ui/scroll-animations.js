/**
 * @param {ParentNode} root
 */
export function initScrollAnimations(root) {
  const nodes = root.querySelectorAll('[data-reveal]');
  if (!nodes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  nodes.forEach((el) => observer.observe(el));
}
