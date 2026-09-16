var yrEl = document.getElementById('yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();
/* ============================================================
   AUTHOR VENTURE — motion + instruments
   GSAP 3.13 + ScrollTrigger only. Every module is self-guarding:
   if its markup isn't on the page, it does nothing. If GSAP fails
   or motion is reduced, the page stays complete and readable.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ==========================================================
     1. CHROME — header, drawer, modal, accordion, filters, forms
     ========================================================== */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-stuck', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = $('.burger'), drawer = $('.drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  var modal = $('#quote-modal'), lastFocus = null;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function focusables() {
    if (!modal) return [];
    return $$(FOCUSABLE, modal).filter(function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }
  /* keep Tab inside the dialog while it is open */
  function trapTab(e) {
    if (e.key !== 'Tab' || !modal || !modal.classList.contains('is-open')) return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', trapTab, true);
    var f = modal.querySelector('input, select, textarea, button');
    if (f) f.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapTab, true);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }
  $$('[data-open-quote]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  $$('[data-close-modal]').forEach(function (b) { b.addEventListener('click', closeModal); });
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modal && modal.classList.contains('is-open')) { closeModal(); return; }
    if (drawer && drawer.classList.contains('is-open')) burger.click();
  });

  $$('.faq-item').forEach(function (item) {
    var btn = $('.faq-q', item), panel = $('.faq-a', item);
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      if (hasGSAP && !reduced) {
        gsap.to(panel, {
          height: open ? panel.scrollHeight : 0, duration: 0.45, ease: 'power2.inOut',
          onComplete: function () { if (open) panel.style.height = 'auto'; }
        });
      } else { panel.style.height = open ? 'auto' : '0px'; }
    });
  });

  var filters = $$('.filter');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      var key = btn.dataset.filter;
      $$('.pf-item').forEach(function (item) {
        var show = key === 'all' || item.dataset.genre === key;
        if (hasGSAP && !reduced) {
          gsap.to(item, {
            opacity: show ? 1 : 0, scale: show ? 1 : 0.97, duration: 0.32,
            onStart: function () { if (show) item.style.display = ''; },
            onComplete: function () { if (!show) item.style.display = 'none'; }
          });
        } else { item.style.display = show ? '' : 'none'; }
      });
    });
  });

  $$('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = $('.form-success', form);
      if (!ok) return;
      $$('.field, .consent, .btn, .form-note', form).forEach(function (el) { el.style.display = 'none'; });
      ok.classList.add('is-visible');
      ok.setAttribute('role', 'status');
      if (hasGSAP && !reduced) gsap.from(ok, { opacity: 0, y: 12, duration: 0.5 });
    });
  });

  /* ==========================================================
     2. STAGE SELECTOR — "where is your book right now?"
     ========================================================== */
  (function stager() {
    var rail = $('.stage-rail');
    if (!rail) return;
    var btns = $$('.stage-btn', rail);
    var fill = $('.stage-fill', rail);
    var panel = $('#stage-panel');
    if (!btns.length || !panel) return;

    var DATA = [
      { tag: 'Stage one', h: 'An idea, and nothing on paper', p: 'Nothing is wrong. Most books live here for years. What you need first is a structure &mdash; a shape that proves the idea can carry 60,000 words before you write any of them.', rec: 'Start with ghostwriting, or an outline session', href: 'services.html#ghostwriting' },
      { tag: 'Stage two', h: 'An outline and a few chapters', p: 'The dangerous stage. Chapter four is where most manuscripts stop, usually because the structure underneath was never load-bearing. Fix the architecture now and the rest gets easier rather than harder.', rec: 'Start with developmental editing', href: 'services.html#editing' },
      { tag: 'Stage three', h: 'A messy full draft', p: 'You have done the hard part, because nobody can edit a book that does not exist. What is left is structural: pacing, order, and the two chapters you already suspect are not earning their place.', rec: 'Start with developmental editing', href: 'services.html#editing' },
      { tag: 'Stage four', h: 'A finished manuscript', p: 'Now it is craft rather than construction. A line edit sharpens how it sounds, a copyedit makes it correct, and a proofread catches what layout breaks. Then it can go to production.', rec: 'Start with a line edit, then a copyedit', href: 'services.html#editing' },
      { tag: 'Stage five', h: 'Edited and ready to publish', p: 'Formatting, cover, ISBN, metadata, distribution. This is where small technical errors cost real money &mdash; a wrong trim size or careless metadata can bury a good book for a year.', rec: 'Start with book publishing', href: 'services.html#publishing' }
    ];

    function select(i) {
      btns.forEach(function (b, n) { b.setAttribute('aria-pressed', String(n === i)); });
      if (fill) fill.style.width = (i / (btns.length - 1) * 100) + '%';
      var d = DATA[i];
      panel.innerHTML =
        '<div><span class="stage-tag">' + d.tag + '</span>' +
        '<h3>' + d.h + '</h3><p>' + d.p + '</p></div>' +
        '<div><p style="color:var(--gold-300);font-size:.88rem;margin-bottom:1.1rem">' + d.rec + '</p>' +
        '<a class="btn btn--gold" href="' + d.href + '">See what that involves</a></div>';
      if (hasGSAP && !reduced) {
        gsap.from(panel.children, { opacity: 0, y: 14, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
      }
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { select(i); }); });
    select(2);
  })();

  /* ==========================================================
     3. SPINE WIDTH CALCULATOR — real print-on-demand maths
     ========================================================== */
  (function spine() {
    var root = $('#calc');
    if (!root) return;
    var pagesEl = $('#calc-pages', root), pagesOut = $('#calc-pages-out', root);
    var paperBtns = $$('[data-paper]', root), trimBtns = $$('[data-trim]', root);
    var outIn = $('#calc-in', root), outMm = $('#calc-mm', root), outTotal = $('#calc-total', root);
    var svg = $('#calc-svg', root);
    if (!pagesEl || !svg) return;
    var spineRect = $('#svg-spine', svg), frontRect = $('#svg-front', svg), spineText = $('#svg-spine-label', svg);

    /* Caliper in inches per page, as used by print-on-demand presses */
    var PAPER = { white: 0.002252, cream: 0.0025, colour: 0.002347 };
    var TRIM = { '5x8': [5, 8], '5.5x8.5': [5.5, 8.5], '6x9': [6, 9] };
    var paper = 'cream', trim = '6x9';

    function draw() {
      var pages = parseInt(pagesEl.value, 10);
      var spineIn = pages * PAPER[paper];
      var t = TRIM[trim];
      if (pagesOut) pagesOut.textContent = pages + ' pages';
      outIn.textContent = spineIn.toFixed(2) + '"';
      outMm.textContent = (spineIn * 25.4).toFixed(1) + ' mm';
      outTotal.textContent = (t[0] * 2 + spineIn).toFixed(2) + '" \u00d7 ' + t[1] + '"';

      var scale = 230 / 9;
      var h = t[1] * scale, w = t[0] * scale, s = Math.max(3, spineIn * scale * 3);
      var x = 150 - (w + s) / 2, y = 250 - h;

      if (hasGSAP && !reduced) {
        gsap.to(spineRect, { attr: { x: x, y: y, width: s, height: h }, duration: 0.5, ease: 'power2.out' });
        gsap.to(frontRect, { attr: { x: x + s, y: y, width: w, height: h }, duration: 0.5, ease: 'power2.out' });
        gsap.to(spineText, { attr: { x: x + s / 2, y: y + h / 2 }, duration: 0.5, ease: 'power2.out' });
      } else {
        spineRect.setAttribute('x', x); spineRect.setAttribute('y', y);
        spineRect.setAttribute('width', s); spineRect.setAttribute('height', h);
        frontRect.setAttribute('x', x + s); frontRect.setAttribute('y', y);
        frontRect.setAttribute('width', w); frontRect.setAttribute('height', h);
        spineText.setAttribute('x', x + s / 2); spineText.setAttribute('y', y + h / 2);
      }
      spineText.style.opacity = s > 24 ? 1 : 0;
    }

    pagesEl.addEventListener('input', draw);
    paperBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        paperBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true'); paper = b.dataset.paper; draw();
      });
    });
    trimBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        trimBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true'); trim = b.dataset.trim; draw();
      });
    });
    draw();
  })();

  /* ==========================================================
     4. ILLUSTRATION STYLE SWITCHER
     ========================================================== */
  (function styler() {
    var root = $('.styler');
    if (!root) return;
    var tabs = $$('.styler-tab', root), scenes = $$('.styler-stage svg', root);
    function show(i) {
      tabs.forEach(function (t, n) { t.setAttribute('aria-pressed', String(n === i)); });
      scenes.forEach(function (s, n) {
        s.classList.toggle('is-active', n === i);
        /* inactive scenes are hidden by opacity only, so they stay in the
           accessibility tree unless we take them out of it explicitly */
        if (n === i) { s.removeAttribute('aria-hidden'); }
        else { s.setAttribute('aria-hidden', 'true'); }
        if (hasGSAP && !reduced) {
          gsap.to(s, { opacity: n === i ? 1 : 0, duration: 0.45, ease: 'power2.inOut' });
          if (n === i) gsap.fromTo(s, { scale: 1.04 }, { scale: 1, duration: 0.8, ease: 'power3.out', transformOrigin: '50% 50%' });
        } else { s.style.opacity = n === i ? 1 : 0; }
      });
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
    show(0);
  })();

  /* ==========================================================
     5. MANUSCRIPT READINESS CHECKLIST
     ========================================================== */
  (function checklist() {
    var root = $('#readiness');
    if (!root) return;
    var boxes = $$('input[type=checkbox]', root);
    var meter = $('.check-meter i', root);
    var verdict = $('#readiness-verdict', root), sub = $('#readiness-sub', root);
    var LEVELS = [
      { min: 0, v: 'Start with a conversation.', s: 'None of this is a prerequisite. Plenty of authors arrive with nothing ticked, and a call will tell you what to do first.' },
      { min: 2, v: 'You need a structural read.', s: 'There is enough here to work with. A developmental edit would tell you whether the shape holds before you spend anything on polish.' },
      { min: 4, v: 'You are close to production.', s: 'A line edit and a copyedit, and this is a book. Send 1,000 words and an editor will confirm which level it actually needs.' },
      { min: 6, v: 'This manuscript is publication-ready.', s: 'Proofread the typeset file and publish. We can quote formatting, cover, and distribution as soon as you send it.' }
    ];
    function update() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (meter) meter.style.width = Math.round(n / boxes.length * 100) + '%';
      var lvl = LEVELS[0];
      LEVELS.forEach(function (l) { if (n >= l.min) lvl = l; });
      if (verdict && verdict.textContent !== lvl.v) {
        verdict.textContent = lvl.v; sub.textContent = lvl.s;
        if (hasGSAP && !reduced) gsap.from([verdict, sub], { opacity: 0, y: 8, duration: 0.4, stagger: 0.05 });
      }
    }
    boxes.forEach(function (b) { b.addEventListener('change', update); });
    update();
  })();

  /* ==========================================================
     6. MOTION — everything below requires GSAP
     ========================================================== */
  if (!hasGSAP || reduced) {
    document.documentElement.classList.add('js-off');
    $$('.ms-text .w[data-role="cut"]').forEach(function (w) { w.style.display = 'none'; });
    $$('.ms-text .ins').forEach(function (w) { w.style.opacity = 1; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* --- reading progress --- */
  var bar = $('.progress');
  if (bar) {
    gsap.to(bar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });
  }

  /* --- page-turn transition on internal navigation ---
     Fail-safe by design: the overlay is hidden unless it is mid-sweep, it
     always resets itself, and it is skipped entirely inside an iframe or
     preview sandbox where navigation may be blocked. */
  var turn = $('.turn');
  if (turn) {
    var inFrame = (function () {
      try { return window.self !== window.top; } catch (e) { return true; }
    })();

    function parkTurn() {
      gsap.killTweensOf(turn);
      gsap.set(turn, { xPercent: -100 });
      turn.classList.remove('is-active');
    }

    /* opening sweep */
    turn.classList.add('is-active');
    gsap.set(turn, { xPercent: -100 });
    gsap.to(turn, {
      xPercent: 100, duration: 0.75, ease: 'power3.inOut', delay: 0.05,
      onComplete: parkTurn
    });

    /* reset on back/forward navigation and bfcache restore */
    window.addEventListener('pageshow', parkTurn);
    window.addEventListener('popstate', parkTurn);

    if (!inFrame && window.location.protocol !== 'blob:') {
      $$('a[href$=".html"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          var navigated = false;
          turn.classList.add('is-active');
          gsap.fromTo(turn, { xPercent: 100 }, {
            xPercent: 0, duration: 0.34, ease: 'power3.inOut',
            onComplete: function () { navigated = true; window.location.href = a.href; }
          });
          /* if navigation is blocked or slow, uncover the page rather than
             leaving the reader staring at a blank panel */
          setTimeout(function () {
            if (!navigated) { window.location.href = a.href; }
            setTimeout(function () {
              gsap.to(turn, { xPercent: -100, duration: 0.5, ease: 'power3.inOut', onComplete: parkTurn });
            }, 700);
          }, 900);
        });
      });
    }
  }

  /* --- hero --- */
  var heroLines = $$('.hero h1 .line > span');
  if (heroLines.length) {
    /* Build paused and start once the webfonts are in, so the headline does
       not animate in Georgia and then reflow when Fraunces arrives. Falls
       back to a 400ms cap if the font promise is slow or unsupported. */
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true });
    var started = false;
    var startHero = function () { if (!started) { started = true; tl.play(); } };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startHero);
      setTimeout(startHero, 400);
    } else {
      startHero();
    }
    tl.from(heroLines, { yPercent: 118, duration: 1.05, stagger: 0.085 })
      .from('.hero .eyebrow', { opacity: 0, x: -14, duration: 0.7 }, 0.15)
      .from('.hero-lede', { opacity: 0, y: 16, duration: 0.8 }, '-=0.55')
      .from('.hero-cta .btn', { opacity: 0, y: 14, duration: 0.6, stagger: 0.08 }, '-=0.5')
      .from('.hero-meta span', { opacity: 0, y: 10, duration: 0.5, stagger: 0.06 }, '-=0.4');

    /* the draft page writes itself, gets marked up, then resolves into type */
    var draft = $$('.spread .pg-draft-line'), strikes = $$('.spread .pg-strike'),
        marks = $$('.spread .pg-mark'), setLines = $$('.spread .pg-set-line'), drop = $('.spread .pg-drop');
    if (draft.length) {
      [draft, strikes, marks].forEach(function (group) {
        group.forEach(function (p) {
          var len = p.getTotalLength ? p.getTotalLength() : 0;
          if (len) gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
      });
      tl.from('.spread .pg-paper, .spread .pg-edge', { opacity: 0, duration: 0.6, stagger: 0.05 }, 0.2)
        .to(draft, { strokeDashoffset: 0, duration: 0.5, stagger: 0.05, ease: 'none' }, 0.45)
        .to(strikes, { strokeDashoffset: 0, duration: 0.35, stagger: 0.1, ease: 'none' }, '-=0.45')
        .to(marks, { strokeDashoffset: 0, duration: 0.45, stagger: 0.09, ease: 'none' }, '-=0.3')
        .from(setLines, { opacity: 0, x: -6, duration: 0.5, stagger: 0.03 }, '-=0.4')
        .from(drop, { opacity: 0, scale: 0.6, duration: 0.6, ease: 'back.out(1.7)', transformOrigin: '0% 100%' }, '-=0.35')
        .from('.spread-caption span', { opacity: 0, y: 8, duration: 0.5, stagger: 0.1 }, '-=0.3');
    }

    /* the spread tilts toward the cursor, like a physical object on a desk */
    var wrap = $('.spread-wrap');
    if (wrap && window.matchMedia('(hover:hover)').matches) {
      var rY = gsap.quickTo(wrap, 'rotationY', { duration: 0.9, ease: 'power3' });
      var rX = gsap.quickTo(wrap, 'rotationX', { duration: 0.9, ease: 'power3' });
      window.addEventListener('mousemove', function (e) {
        var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        rY((e.clientX - cx) / cx * 5);
        rX(-(e.clientY - cy) / cy * 3.5);
      });
    }
  }

  /* --- generic reveals --- */
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out', stagger: 0.08 }); }
  });
  $$('[data-anim="head"]').forEach(function (el) {
    gsap.from(el, {
      opacity: 0, y: 22, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* --- seamless marquee --- */
  (function marquee() {
    var mt = $('.marquee-track');
    if (!mt) return;
    /* clone the row so the loop is seamless, but keep the copy out of the
       accessibility tree — otherwise every title is announced twice */
    var clone = mt.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(clone.children, function (c) { c.setAttribute('aria-hidden', 'true'); });
    while (clone.firstChild) { mt.appendChild(clone.firstChild); }

    var half = mt.scrollWidth / 2;
    var loop = gsap.to(mt, { x: -half, duration: 38, ease: 'none', repeat: -1, paused: true });
    /* only run it while it is actually on screen */
    ScrollTrigger.create({
      trigger: mt.closest('.marquee') || mt,
      start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { self.isActive ? loop.play() : loop.pause(); }
    });
  })();

  /* ==========================================================
     7. THE LIVING MANUSCRIPT — signature moment.
     A real line edit, performed at the speed you scroll.
     ========================================================== */
  (function manuscript() {
    var page = $('.ms-page');
    if (!page) return;
    var cuts = $$('.ms-text .w[data-role="cut"]');
    var ins = $$('.ms-text .ins');
    var counter = $('#ms-count');
    var marks = $$('.ms-mark');
    if (!cuts.length) return;

    function measure() {
      cuts.concat(ins).forEach(function (el) {
        el.style.width = '';
        var w = el.getBoundingClientRect().width;
        el.dataset.w = w;
        el.style.width = w + 'px';
      });
      gsap.set(ins, { width: 0, opacity: 0 });
    }
    measure();

    var all = $$('.ms-text .w');
    var startCount = all.length;
    var endCount = all.length - cuts.length + ins.length;
    var proxy = { n: startCount };
    if (counter) counter.textContent = startCount;
    gsap.set(marks, { x: -10, opacity: 0 });

    gsap.timeline({
      scrollTrigger: {
        trigger: '.ms-section', start: 'top top', end: '+=1800', scrub: 0.7,
        pin: '.ms-stage', anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: measure
      }
    })
      .to(cuts, { color: '#B4472F', duration: 0.5, stagger: 0.012 })
      .to(marks[0], { opacity: 1, x: 0, duration: 0.4 }, '<0.2')
      .to('.ms-text .w[data-role="cut"] .strike', { scaleX: 1, duration: 0.5, stagger: 0.02, ease: 'power1.inOut' }, '>-0.2')
      .to(cuts, { width: 0, opacity: 0, duration: 0.7, stagger: 0.018, ease: 'power2.inOut' }, '>0.3')
      .to(proxy, {
        n: endCount, duration: 1, ease: 'power2.inOut',
        onUpdate: function () { if (counter) counter.textContent = Math.round(proxy.n); }
      }, '<')
      .to(marks[1], { opacity: 1, x: 0, duration: 0.4 }, '<0.4')
      .to(ins, { width: function (i, t) { return t.dataset.w + 'px'; }, opacity: 1, duration: 0.5, stagger: 0.12 }, '>-0.3')
      .to(marks[2], { opacity: 1, x: 0, duration: 0.4 }, '>0.1')
      .to('.ms-page', { boxShadow: '0 40px 90px -50px rgba(11,31,58,.55)', duration: 0.6 }, '<');
  })();

  /* ==========================================================
     8. THE GOLD PATH — the logo device as a scroll instrument
     ========================================================== */
  $$('.path-wrap').forEach(function (wrap) {
    var path = $('.path-svg path', wrap);
    if (!path) return;
    var len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top 72%', end: 'bottom 78%', scrub: 0.8 }
    });
    $$('.step-dot', wrap).forEach(function (dot) {
      gsap.from(dot, {
        scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(2)',
        scrollTrigger: { trigger: dot, start: 'top 82%', once: true }
      });
    });
  });

  /* --- portfolio grid parallax --- */
  $$('.pf-grid .pf-cover').forEach(function (cover) {
    gsap.fromTo(cover, { yPercent: 3.5 }, {
      yPercent: -3.5, ease: 'none',
      scrollTrigger: { trigger: cover, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* --- pinned horizontal shelf --- */
  var track = $('.hpanels-track');
  if (track) {
    /* matchMedia so the pinned scroll builds and tears down on resize —
       reading innerWidth once meant widening past 1024 never enabled it */
    ScrollTrigger.matchMedia({
      '(min-width: 1025px)': function () {
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
        var horiz = gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: track.closest('.hpanels'), pin: true, scrub: 0.9, anticipatePin: 1,
            end: function () { return '+=' + dist(); }, invalidateOnRefresh: true
          }
        });
        $$('.shelf-item').forEach(function (item) {
          gsap.from(item, {
            opacity: 0, y: 34, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: item, containerAnimation: horiz, start: 'left 94%', once: true }
          });
        });
        return function () { gsap.set(track, { x: 0 }); };
      }
    });
  }

  /* --- arcs drift --- */
  $$('.cta-arc, .hero-arc').forEach(function (arc) {
    gsap.to(arc, {
      rotate: 20, ease: 'none',
      scrollTrigger: { trigger: arc.closest('section') || arc, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    });
  });

  /* --- pull quotes read in, word by word --- */
  $$('.pull[data-split]').forEach(function (el) {
    /* Walk the text nodes and wrap words in place, so inline markup inside
       the quote (e.g. <span> emphasis) survives the split. Rebuilding from
       textContent would flatten it. */
    (function splitTextNodes(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          if (!child.nodeValue.trim()) return;
          var frag = document.createDocumentFragment();
          child.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'pw';
            s.textContent = part;
            frag.appendChild(s);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          splitTextNodes(child);
        }
      });
    })(el);
    gsap.from($$('.pw', el), {
      opacity: 0.14, duration: 0.5, stagger: 0.06, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 84%', end: 'bottom 62%', scrub: 0.6 }
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();

