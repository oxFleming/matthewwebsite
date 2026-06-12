/* ═══════════════════════════════════════════════════════════
   DECOR.JS — geometric illustration scatter system
   Injects original flat shape clusters into every major section.
   Self-contained: styles + SVG templates + placement logic.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var BLUE = '#0466e8', AMBER = '#ffb400', ORANGE = '#ff5c00',
      GREEN = '#1fa63c', PURPLE = '#b65cf0', NAVY = '#16283f', CREAM = '#f5efe5';

  // ─── Original shape cluster templates (flat illustrator style) ───
  var TEMPLATES = [
    // 0: quarter circle + dot + tick
    '<svg viewBox="0 0 200 200" fill="none"><path d="M0 200 A200 200 0 0 1 200 0 L200 200 Z" fill="' + BLUE + '"/><circle cx="150" cy="150" r="22" fill="' + CREAM + '"/><circle cx="46" cy="60" r="16" fill="' + ORANGE + '"/></svg>',
    // 1: half circle + zigzag
    '<svg viewBox="0 0 200 160" fill="none"><path d="M10 150 A90 90 0 0 1 190 150 Z" fill="' + AMBER + '"/><path d="M30 40 L60 10 L90 40 L120 10 L150 40" stroke="' + NAVY + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="178" cy="36" r="13" fill="' + GREEN + '"/></svg>',
    // 2: donut + triangle
    '<svg viewBox="0 0 200 200" fill="none"><circle cx="86" cy="100" r="64" fill="' + ORANGE + '"/><circle cx="86" cy="100" r="26" fill="' + CREAM + '"/><path d="M150 170 L190 110 L196 178 Z" fill="' + PURPLE + '"/><circle cx="170" cy="48" r="10" fill="' + BLUE + '"/></svg>',
    // 3: asterisk burst + pill
    '<svg viewBox="0 0 200 180" fill="none"><g stroke="' + NAVY + '" stroke-width="9" stroke-linecap="round"><path d="M70 110 V40"/><path d="M70 75 L40 45"/><path d="M70 75 L100 45"/><path d="M70 75 L36 86"/><path d="M70 75 L104 86"/></g><rect x="96" y="120" width="96" height="44" rx="22" fill="' + GREEN + '"/><circle cx="160" cy="56" r="17" fill="' + AMBER + '"/></svg>',
    // 4: overlapping circles flower
    '<svg viewBox="0 0 200 200" fill="none"><circle cx="80" cy="80" r="46" fill="' + PURPLE + '" fill-opacity="0.9"/><circle cx="130" cy="80" r="46" fill="' + BLUE + '" fill-opacity="0.85"/><circle cx="105" cy="124" r="46" fill="' + AMBER + '" fill-opacity="0.9"/><circle cx="105" cy="94" r="14" fill="' + CREAM + '"/></svg>',
    // 5: stairs + dot
    '<svg viewBox="0 0 200 160" fill="none"><path d="M20 150 V110 h40 v-40 h40 v-40 h40 v120 Z" fill="' + GREEN + '"/><circle cx="48" cy="44" r="18" fill="' + ORANGE + '"/><path d="M150 30 h36" stroke="' + NAVY + '" stroke-width="8" stroke-linecap="round"/></svg>',
    // 6: arch window + bits
    '<svg viewBox="0 0 180 200" fill="none"><path d="M30 190 V90 a60 60 0 0 1 120 0 V190 Z" fill="' + BLUE + '"/><circle cx="90" cy="92" r="20" fill="' + AMBER + '"/><path d="M20 36 L40 12 L60 36" stroke="' + ORANGE + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    // 7: pill stack + ring
    '<svg viewBox="0 0 200 180" fill="none"><rect x="16" y="110" width="120" height="46" rx="23" fill="' + ORANGE + '"/><rect x="50" y="56" width="120" height="46" rx="23" fill="' + PURPLE + '"/><circle cx="60" cy="30" r="18" stroke="' + GREEN + '" stroke-width="9"/></svg>'
  ];

  var CORNERS = [
    { top: '-46px', right: '-52px' },
    { bottom: '-50px', left: '-48px' },
    { top: '-44px', left: '-50px' },
    { bottom: '-46px', right: '-46px' }
  ];

  var ROTS = [0, 12, -10, 22, -18, 8];
  var SIZES = [150, 185, 130, 205, 165, 145];

  // ─── Inject style once ────────────────────────────────────
  var style = document.createElement('style');
  style.textContent =
    '.decor-shape{position:absolute;pointer-events:none;z-index:0;opacity:.85;}' +
    '.decor-shape svg{width:100%;height:auto;display:block;}' +
    '@keyframes decorFloat{0%,100%{transform:translateY(0) rotate(var(--rot,0deg));}50%{transform:translateY(-12px) rotate(var(--rot,0deg));}}' +
    '.decor-shape{animation:decorFloat var(--dur,9s) ease-in-out infinite;}' +
    '@media (max-width:768px){.decor-shape{transform:scale(.6);opacity:.55;}}';
  document.head.appendChild(style);

  // ─── Place clusters ───────────────────────────────────────
  function decorate() {
    var sections = document.querySelectorAll('section');
    var placed = 0;

    sections.forEach(function (sec, i) {
      // Skip unsuitable hosts
      if (sec.classList.contains('hero')) return;                    // home hero has its own
      if (sec.classList.contains('cinematic-intro')) return;
      if (sec.classList.contains('fgip-collections-section')) return; // pinned scroll section
      if (sec.classList.contains('page-nav-strip')) return;
      if (sec.offsetHeight < 260) return;

      var cs = getComputedStyle(sec);
      if (cs.position === 'static') sec.style.position = 'relative';
      if (cs.overflow !== 'hidden') sec.style.overflow = 'hidden';

      var idx = placed;
      var wrap = document.createElement('div');
      wrap.className = 'decor-shape';
      wrap.setAttribute('aria-hidden', 'true');

      var corner = CORNERS[idx % CORNERS.length];
      Object.keys(corner).forEach(function (k) { wrap.style[k] = corner[k]; });

      var mobileScale = window.innerWidth <= 768 ? 0.6 : 1;
      wrap.style.width = Math.round(SIZES[idx % SIZES.length] * mobileScale) + 'px';
      wrap.style.setProperty('--rot', ROTS[idx % ROTS.length] + 'deg');
      wrap.style.setProperty('--dur', (8 + (idx % 5) * 1.4) + 's');
      wrap.innerHTML = TEMPLATES[idx % TEMPLATES.length];

      sec.appendChild(wrap);

      // Every third section gets a tiny companion accent on the opposite side
      if (idx % 3 === 1) {
        var mini = document.createElement('div');
        mini.className = 'decor-shape';
        mini.setAttribute('aria-hidden', 'true');
        var op = CORNERS[(idx + 2) % CORNERS.length];
        Object.keys(op).forEach(function (k) { mini.style[k] = op[k]; });
        mini.style.width = Math.round(84 * mobileScale) + 'px';
        mini.style.opacity = '0.7';
        mini.style.setProperty('--rot', ROTS[(idx + 3) % ROTS.length] + 'deg');
        mini.style.setProperty('--dur', (10 + (idx % 4)) + 's');
        mini.innerHTML = TEMPLATES[(idx + 4) % TEMPLATES.length];
        sec.appendChild(mini);
      }

      placed++;
    });

    // Gentle scroll drift if GSAP is available
    if (window.gsap && window.ScrollTrigger) {
      document.querySelectorAll('.decor-shape').forEach(function (el, i) {
        gsap.to(el, {
          yPercent: i % 2 === 0 ? 14 : -14,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorate);
  } else {
    decorate();
  }
})();
