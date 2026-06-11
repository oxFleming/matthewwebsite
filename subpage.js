/* ═══════════════════════════════════════════════════════════
   MATTHEW KALESANWO — subpage.js
   Shared animations for all subpages
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ─── LENIS ─────────────────────────────────────────────────
  const lenis = new Lenis({
    duration: 1.35,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ─── PAGE TRANSITION ──────────────────────────────────────
  const overlay = document.getElementById('page-transition-overlay');

  function navigateTo(href) {
    if (!overlay) { window.location.href = href; return; }
    lenis.stop();
    gsap.to(overlay, {
      opacity: 1, duration: 0.38, ease: 'power2.inOut',
      onComplete: () => { window.location.href = href; }
    });
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    e.preventDefault();
    navigateTo(href);
  });

  window.addEventListener('pageshow', () => {
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.5, ease: 'power2.out' });
  });

  // ─── SCROLL PROGRESS BAR ──────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  document.body.appendChild(progressBar);

  gsap.to(progressBar, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
  });

  // ─── SECTION TITLE PARALLAX DRIFT ─────────────────────────
  function initTitleDrift() {
    document.querySelectorAll('.section-title, .section-title-light').forEach(el => {
      gsap.fromTo(el, { yPercent: 8 }, {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });
    });
  }

  // ─── CHAR SPLIT ───────────────────────────────────────────
  // Splits headings into chars while keeping whole words intact (each word
  // is a nowrap inline-block) and preserving <br> tags, so headings never
  // break mid-word.
  function splitChars(el) {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            el.appendChild(document.createTextNode(' '));
            return;
          }
          const word = document.createElement('span');
          word.className = 'split-word';
          part.split('').forEach(ch => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = ch;
            word.appendChild(span);
          });
          el.appendChild(word);
        });
      } else if (node.nodeName === 'BR') {
        el.appendChild(document.createElement('br'));
      } else {
        el.appendChild(node);
      }
    });
    return el.querySelectorAll('.char');
  }

  // ─── SIDE MENU ────────────────────────────────────────────
  const burger = document.getElementById('subBurger');
  const sideMenu = document.getElementById('sideMenu');
  const menuClose = document.getElementById('menuClose');

  if (burger && sideMenu) {
    burger.addEventListener('click', () => {
      sideMenu.classList.add('open');
      burger.querySelector('span:first-child').style.transform = 'rotate(45deg) translate(4px,4px)';
      burger.querySelector('span:last-child').style.transform = 'rotate(-45deg) translate(4px,-4px)';
    });

    const close = () => {
      sideMenu.classList.remove('open');
      if (burger) burger.querySelectorAll('span').forEach(s => s.style.transform = '');
    };

    if (menuClose) menuClose.addEventListener('click', close);
    sideMenu.querySelectorAll('.side-menu-link').forEach(l => l.addEventListener('click', close));
  }

  // ─── ACTIVE NAV LINK ──────────────────────────────────────
  function setActiveNav() {
    const path = window.location.pathname.replace(/^.*\//, '');
    document.querySelectorAll('.sub-nav-links a').forEach(a => {
      const href = a.getAttribute('href')?.replace(/^.*\//, '');
      if (href && path && href === path) a.classList.add('active');
    });
  }

  // ─── MAGNETIC BUTTONS ─────────────────────────────────────
  function initMagnetic() {
    document.querySelectorAll('.cta-magnetic').forEach(wrapper => {
      const btn = wrapper.querySelector('a, button') || wrapper;
      wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.38;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.38;
        gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
      });
      wrapper.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  // ─── CHAR SPLIT PAGE TITLES ───────────────────────────────
  function initBannerTitle() {
    const title = document.querySelector('.page-banner-title');
    if (!title) return;
    const chars = splitChars(title);
    gsap.to(chars, {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out', stagger: 0.018, delay: 0.25
    });
  }

  // ─── SCRAMBLE NUMBERS ─────────────────────────────────────
  const CHARS = '0123456789';
  function scramble(el) {
    const raw = el.getAttribute('data-target') || el.textContent;
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
    const suffix = raw.match(/[^0-9.]*$/)?.[0] || '';
    if (isNaN(num)) return;
    let frame = 0;
    const total = 28;
    const isInt = Number.isInteger(num);
    function tick() {
      frame++;
      if (frame < total) {
        const s = Array.from({ length: String(Math.round(num)).length }, () =>
          CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
        el.textContent = prefix + s + suffix;
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + (isInt ? num : num.toFixed(1)) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  function initScramble() {
    document.querySelectorAll('[data-scramble]').forEach(el => {
      el.setAttribute('data-target', el.textContent);
      ScrollTrigger.create({
        trigger: el, start: 'top 82%', once: true,
        onEnter: () => scramble(el)
      });
    });
  }

  // ─── FADE-UPS ─────────────────────────────────────────────
  function initReveal() {
    document.querySelectorAll('.fade-up').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => el.classList.add('visible')
      });
    });
  }

  // ─── STAGGER CHILDREN ─────────────────────────────────────
  function initStagger() {
    document.querySelectorAll('[data-stagger]').forEach(parent => {
      const children = parent.querySelectorAll('[data-stagger-child]');
      gsap.from(children, {
        opacity: 0, y: 28,
        duration: 0.72, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: parent, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
  }

  // ─── SECTION TITLE CHAR SPLITS ────────────────────────────
  function initCharSplits() {
    document.querySelectorAll('.section-title, .section-title-light').forEach(el => {
      const chars = splitChars(el);
      gsap.to(chars, {
        opacity: 1, y: 0,
        duration: 0.85, ease: 'power3.out', stagger: 0.022,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });
  }

  // ─── PAGE ENTRANCE ANIMATIONS ─────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initBannerTitle();
    initMagnetic();
    initScramble();
    initReveal();
    initStagger();
    initCharSplits();
    initTitleDrift();

    // Eyebrow fade
    gsap.from('.page-banner-eyebrow', { opacity: 0, y: 10, duration: 0.6, ease: 'power3.out', delay: 0.15 });
    gsap.from('.page-banner-sub', { opacity: 0, y: 18, duration: 0.7, ease: 'power3.out', delay: 0.45 });
    gsap.from('.back-link', { opacity: 0, x: -16, duration: 0.6, ease: 'power3.out', delay: 0.1 });

    // Generic section char splits (already in initCharSplits)
    // Clip reveals
    document.querySelectorAll('.clip-reveal').forEach(el => {
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
  });

  // ─── SMOOTH ANCHORS ───────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80, duration: 1.4 }); }
    });
  });

})();
