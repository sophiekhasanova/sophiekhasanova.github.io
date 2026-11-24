(function () {
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia && matchMedia('(max-width:760px)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var header = document.querySelector('.hdr');

  var HEADER_HIDE_AFTER = 140; // px scrolled before the mobile header can hide
  var SCROLL_THRESHOLD = 6; // px of movement that counts as a scroll direction
  var REVEAL_STAGGER = 70; // ms between items revealed together

  // Pause case mockup animations while they are off screen
  function pauseOffscreenMockups() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('off', !entry.isIntersecting);
      });
    }, { rootMargin: '80px 0px' });

    document.querySelectorAll('.mk').forEach(function (mk) {
      observer.observe(mk);
    });
  }

  // Mobile: simple fade-in on scroll instead of scroll-driven animations
  function revealOnScroll() {
    document.documentElement.classList.add('js-io');

    var observer = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = n++ * REVEAL_STAGGER + 'ms';
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll('.rv,.rv2').forEach(function (el) {
      observer.observe(el);
    });
  }

  // Mobile: hide the header when scrolling down, show it when scrolling up
  function autoHideHeader() {
    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      var goingDown = y > lastY + SCROLL_THRESHOLD;
      var goingUp = y < lastY - SCROLL_THRESHOLD;

      if (goingDown && y > HEADER_HIDE_AFTER) header.classList.add('hid');
      else if (goingUp || y < HEADER_HIDE_AFTER) header.classList.remove('hid');

      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
  }

  // "Say hi" menu with Telegram and email
  function setupContactMenu() {
    var menu = createContactMenu();
    var openButton = null;

    function open(btn) {
      var rect = btn.getBoundingClientRect();
      menu.style.top = rect.bottom + 8 + 'px';
      menu.style.right = Math.max(12, window.innerWidth - rect.right) + 'px';
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      openButton = btn;
    }

    function close() {
      menu.classList.remove('open');
      if (openButton) openButton.setAttribute('aria-expanded', 'false');
      openButton = null;
    }

    function onClick(e) {
      var btn = e.target.closest && e.target.closest('.hcta');
      if (btn) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (openButton === btn) close();
        else open(btn);
        return;
      }
      if (openButton && !menu.contains(e.target)) close();
      else if (menu.contains(e.target)) setTimeout(close, 50);
    }

    document.querySelectorAll('.hcta').forEach(function (btn) {
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');
    });

    // capture phase, so it runs before the anchor link handler
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('scroll', function () {
      if (openButton) close();
    }, { passive: true });
  }

  function createContactMenu() {
    var menu = document.createElement('div');
    menu.className = 'hipop';
    menu.setAttribute('role', 'menu');
    menu.innerHTML =
      '<a role="menuitem" href="https://t.me/kalvaaani" target="_blank" rel="noopener">Telegram<span>@kalvaaani</span></a>' +
      '<a role="menuitem" href="mailto:sophieekhasanova@gmail.com">Email<span>Gmail</span></a>';
    document.body.appendChild(menu);
    return menu;
  }

  // Anchor links: scroll with an offset for the sticky header
  function setupAnchorLinks() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      window.scrollTo({
        top: scrollTargetY(id, target),
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      history.replaceState(null, '', '#' + id);
    });
  }

  function scrollTargetY(id, target) {
    if (id === 'top') return 0;
    var top = target.getBoundingClientRect().top;
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var offset = isMobile && top > 0 ? 16 : headerHeight + 24;
    return top + window.scrollY - offset;
  }

  // Hero: Design / Build toggle
  function setupModeToggle(hero) {
    var buttons = hero.querySelectorAll('.seg');

    function setMode(mode) {
      hero.className = mode === 'design' ? 'is-design' : 'is-build';
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.dataset.set === mode);
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode(btn.dataset.set);
      });
    });
    setMode('design');
  }

  // Contact section: copy email button
  function setupCopyButton(btn) {
    btn.addEventListener('click', function () {
      try {
        navigator.clipboard.writeText(btn.dataset.copy);
      } catch (err) {}
      btn.textContent = 'Copied';
      setTimeout(function () {
        btn.textContent = 'Copy';
      }, 1600);
    });
  }

  if (hasIO) pauseOffscreenMockups();
  if (isMobile && hasIO && !reduceMotion) revealOnScroll();
  if (isMobile && header) autoHideHeader();
  setupContactMenu();
  setupAnchorLinks();

  var hero = document.querySelector('[data-mode]');
  if (hero) setupModeToggle(hero);

  var copyButton = document.querySelector('[data-copy]');
  if (copyButton) setupCopyButton(copyButton);
})();
