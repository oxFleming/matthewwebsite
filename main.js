/* ═══════════════════════════════════════════════════════════
   MATTHEW KALESANWO — main.js
   GSAP 3.12 + ScrollTrigger + Lenis smooth scroll
   Upgraded effects: char-split, magnetic, clip-path, scramble,
   3-layer parallax, page transitions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ─── LENIS SMOOTH SCROLL ──────────────────────────────────
  const lenis = new Lenis({
    duration: 1.35,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 0.9,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ─── PAGE TRANSITION OVERLAY ──────────────────────────────
  const overlay = document.getElementById('page-transition-overlay');

  function navigateTo(href) {
    if (!overlay) { window.location.href = href; return; }
    lenis.stop();
    gsap.to(overlay, {
      opacity: 1, duration: 0.4, ease: 'power2.inOut',
      onComplete: () => { window.location.href = href; }
    });
  }

  // Intercept internal links
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    e.preventDefault();
    navigateTo(href);
  });

  // Fade in on load
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

  // ─── VELOCITY SKEW — glossy momentum on lists ─────────────
  const skewSetter = gsap.quickSetter('[data-skew], .career-item, .value-card', 'skewY', 'deg');
  const skewClamp = gsap.utils.clamp(-1.4, 1.4);
  let skewProxy = 0;

  lenis.on('scroll', ({ velocity }) => {
    const target = skewClamp(velocity * 0.18);
    skewProxy += (target - skewProxy) * 0.15;
    skewSetter(skewProxy);
  });
  gsap.ticker.add(() => {
    if (Math.abs(skewProxy) > 0.01) {
      skewProxy *= 0.88;
      skewSetter(skewProxy);
    }
  });

  // ─── SECTION TITLE PARALLAX DRIFT ─────────────────────────
  function initTitleDrift() {
    document.querySelectorAll('.section-title, .section-title-light, .value-title').forEach(el => {
      gsap.fromTo(el, { yPercent: 8 }, {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });
    });
  }

  // ─── CURSOR GLOW ──────────────────────────────────────────
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', e => {
    gsap.to(cursorGlow, { x: e.clientX, y: e.clientY, duration: 0.9, ease: 'power2.out' });
  });

  // ─── CHAR SPLIT UTILITY ────────────────────────────────────
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

  // ─── MOBILE NAV MENU ──────────────────────────────────────
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      burger.querySelector('span:first-child').style.transform = menuOpen ? 'rotate(45deg) translate(4px,4px)' : '';
      burger.querySelector('span:last-child').style.transform = menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : '';
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => s.style.transform = '');
    }));
  }

  // ─── CINEMATIC INTRO ──────────────────────────────────────
  function runCinematicIntro() {
    const intro = document.getElementById('cinematicIntro');
    if (!intro) return;

    let finished = false;
    function finishIntro() {
      if (finished) return;
      finished = true;
      intro.style.display = 'none';
      lenis.start();
      document.body.style.overflow = '';
      initScrollAnimations();
    }

    // Skip the intro entirely if the tab is hidden — rAF is paused there,
    // so the timeline would never advance and the page would stay locked.
    if (document.hidden) { finishIntro(); return; }

    const eyebrow = intro.querySelector('.intro-eyebrow');
    const names = intro.querySelectorAll('.intro-name');
    const sub = intro.querySelector('.intro-sub');

    lenis.stop();
    document.body.style.overflow = 'hidden';

    // Hard fallback: never leave the page locked, even if the tab loses
    // visibility mid-animation (setTimeout keeps running, rAF does not).
    setTimeout(finishIntro, 6000);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(intro, {
          yPercent: -100, duration: 1.15, ease: 'power4.inOut',
          onComplete: finishIntro
        });
      }
    });

    tl
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.3)
      .to(names[0], { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out' }, 0.65)
      .to(names[1], { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out' }, 0.78)
      .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.2)
      .to([eyebrow, sub], { opacity: 0, duration: 0.5, ease: 'power2.in' }, 2.3)
      .to(names, { opacity: 0, y: -30, duration: 0.65, ease: 'power2.in', stagger: 0.04 }, 2.35);
  }

  // ─── HERO LETTERS ENTRANCE ────────────────────────────────
  function animateHeroLetters() {
    const letters = document.querySelectorAll('.hero-letter');
    gsap.to(letters, { opacity: 1, y: 0, duration: 1.3, ease: 'power4.out', stagger: 0.07, delay: 0.15 });
  }

  // ─── 3-LAYER HERO PARALLAX ────────────────────────────────
  function initHeroParallax() {
    const titleFilled = document.querySelector('.hero-title');
    const titleOutline = document.querySelector('.hero-title-outline');
    if (!titleFilled) return;

    gsap.to(titleFilled, {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    if (titleOutline) {
      gsap.to(titleOutline, {
        yPercent: 38, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 }
      });
    }

    // Fade hero content on scroll
    gsap.to('.hero-inner', {
      opacity: 0.4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true }
    });
  }

  // ─── MAGNETIC BUTTONS ─────────────────────────────────────
  function initMagneticButtons() {
    document.querySelectorAll('.cta-magnetic').forEach(wrapper => {
      const btn = wrapper.querySelector('a, button') || wrapper;
      const strength = 0.4;

      wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
      });

      wrapper.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ─── CHAR-SPLIT SECTION TITLES ────────────────────────────
  function initCharSplitTitles() {
    document.querySelectorAll('.section-title, .section-title-light').forEach(el => {
      const chars = splitChars(el);
      gsap.to(chars, {
        opacity: 1, y: 0,
        duration: 0.85, ease: 'power3.out',
        stagger: 0.022,
        scrollTrigger: {
          trigger: el, start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ─── NUMBER SCRAMBLE ──────────────────────────────────────
  const CHARS = '0123456789';

  function scrambleNum(el) {
    const raw = el.getAttribute('data-target') || el.textContent;
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
    const suffix = raw.match(/[^0-9.]*$/)?.[0] || '';
    if (isNaN(num)) return;

    let frame = 0;
    const totalFrames = 28;
    const isInt = Number.isInteger(num);

    function tick() {
      frame++;
      if (frame < totalFrames) {
        const scrambled = Array.from({ length: String(Math.round(num)).length }, () =>
          CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('');
        el.textContent = prefix + scrambled + suffix;
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + (isInt ? num : num.toFixed(1)) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  function initScrambleNumbers() {
    document.querySelectorAll('[data-scramble]').forEach(el => {
      el.setAttribute('data-target', el.textContent);
      ScrollTrigger.create({
        trigger: el, start: 'top 82%', once: true,
        onEnter: () => scrambleNum(el)
      });
    });
  }

  // ─── CLIP-PATH REVEALS ────────────────────────────────────
  function initClipReveal() {
    document.querySelectorAll('.clip-reveal').forEach(el => {
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
  }

  // ─── ABOUT WORD REVEAL ────────────────────────────────────
  function initWordReveal() {
    const para = document.getElementById('aboutParagraph');
    if (!para) return;

    const text = para.textContent;
    const words = text.trim().split(/\s+/);
    para.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
    const wordEls = para.querySelectorAll('.word');

    ScrollTrigger.create({
      trigger: para, start: 'top 80%', end: 'bottom 25%', scrub: true,
      onUpdate: self => {
        const active = Math.floor(self.progress * wordEls.length * 1.25);
        wordEls.forEach((w, i) => w.classList.toggle('active', i < active));
      }
    });
  }

  // ─── CAREER LIST STAGGER ─────────────────────────────────
  function initCareerReveal() {
    document.querySelectorAll('.career-item').forEach(item => {
      gsap.from(item, {
        opacity: 0, x: -36,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 86%', toggleActions: 'play none none none' }
      });
    });
  }

  // ─── PROJECT CARDS ────────────────────────────────────────
  function initProjectCards() {
    gsap.from('.project-card', {
      opacity: 0, y: 48,
      duration: 0.8, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.projects-grid', start: 'top 82%', toggleActions: 'play none none none' }
    });
  }

  // ─── EXPERTISE GROUPS ─────────────────────────────────────
  function initExpertiseReveal() {
    gsap.from('.expertise-group', {
      opacity: 0, y: 28,
      duration: 0.7, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.expertise-grid', start: 'top 82%', toggleActions: 'play none none none' }
    });
  }

  // ─── VALUE CARDS ──────────────────────────────────────────
  function initValueCards() {
    gsap.from('.value-card', {
      opacity: 0, y: 32,
      duration: 0.8, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.value-grid', start: 'top 82%', toggleActions: 'play none none none' }
    });
  }

  // ─── METRICS REVEAL ───────────────────────────────────────
  function initMetrics() {
    gsap.from('.metric-item', {
      opacity: 0, y: 32,
      duration: 0.75, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.metrics-grid', start: 'top 82%', toggleActions: 'play none none none' }
    });
  }

  // ─── FGIP STAT CARDS ──────────────────────────────────────
  function initFgipStats() {
    gsap.from('.fgip-stat-card', {
      opacity: 0, scale: 0.94,
      duration: 0.7, ease: 'back.out(1.4)', stagger: 0.1,
      scrollTrigger: { trigger: '.fgip-teaser-visual', start: 'top 84%', toggleActions: 'play none none none' }
    });
  }

  // ─── CONTACT REVEAL ───────────────────────────────────────
  function initContactReveal() {
    const title = document.querySelector('.contact-title');
    if (title) {
      gsap.from(title, {
        opacity: 0, y: 80,
        duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
    gsap.from('.contact-group', {
      opacity: 0, y: 24,
      duration: 0.7, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.contact-grid', start: 'top 85%', toggleActions: 'play none none none' }
    });
  }

  // ─── MARQUEE VELOCITY ─────────────────────────────────────
  function initMarqueeVelocity() {
    const tracks = document.querySelectorAll('.hero-marquee-track');
    lenis.on('scroll', ({ velocity }) => {
      const d = Math.max(5, 20 - Math.abs(velocity) * 2.5);
      tracks.forEach(t => t.style.animationDuration = `${d}s`);
    });
  }

  // ─── POSITIONING SECTION ──────────────────────────────────
  function initPositioningReveal() {
    gsap.from('.positioning-body', {
      opacity: 0, y: 24,
      duration: 0.8, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: '.positioning-section', start: 'top 82%', toggleActions: 'play none none none' }
    });
  }

  // ─── GENERIC FADE-UP ELEMENTS ─────────────────────────────
  function initFadeUps() {
    document.querySelectorAll('.fade-up').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => el.classList.add('visible')
      });
    });
  }

  // ─── EYEBROW REVEAL ───────────────────────────────────────
  function initEyebrows() {
    document.querySelectorAll('.section-eyebrow, .positioning-eyebrow').forEach(el => {
      gsap.from(el, {
        opacity: 0, y: 10,
        duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      });
    });
  }

  // ─── SMOOTH ANCHORS ───────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80, duration: 1.4 }); }
    });
  });

  // ─── INIT ALL ─────────────────────────────────────────────
  function initScrollAnimations() {
    animateHeroLetters();
    initHeroParallax();
    initMagneticButtons();
    initCharSplitTitles();
    initScrambleNumbers();
    initClipReveal();
    initWordReveal();
    initCareerReveal();
    initProjectCards();
    initExpertiseReveal();
    initValueCards();
    initMetrics();
    initFgipStats();
    initContactReveal();
    initMarqueeVelocity();
    initPositioningReveal();
    initFadeUps();
    initEyebrows();
    initTitleDrift();
  }

  window.addEventListener('DOMContentLoaded', () => {
    runCinematicIntro();
  });

})();
