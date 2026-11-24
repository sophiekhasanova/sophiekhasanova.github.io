(function () {
  var reduceMotion =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia && matchMedia("(max-width:760px)").matches;
  var hasIO = "IntersectionObserver" in window;
  var header = document.querySelector(".hdr");

  // pause case mockup animations while they are off screen
  if (hasIO) {
    var mockObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("off", !entry.isIntersecting);
        });
      },
      { rootMargin: "80px 0px" },
    );
    document.querySelectorAll(".mk").forEach(function (mk) {
      mockObserver.observe(mk);
    });
  }

  // mobile: simple fade-in on scroll instead of scroll-driven animations
  if (isMobile && hasIO && !reduceMotion) {
    document.documentElement.classList.add("js-io");
    var revealObserver = new IntersectionObserver(
      function (entries) {
        var n = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = n++ * 70 + "ms";
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll(".rv,.rv2").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // mobile: hide the header when scrolling down, show it when scrolling up
  if (isMobile && header) {
    var lastY = window.scrollY;
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y > lastY + 6 && y > 140) header.classList.add("hid");
          else if (y < lastY - 6 || y < 140) header.classList.remove("hid");
          lastY = y;
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  // "Say hi" menu
  var menu = document.createElement("div");
  menu.className = "hipop";
  menu.setAttribute("role", "menu");
  menu.innerHTML =
    '<a role="menuitem" href="https://t.me/kalvaaani" target="_blank" rel="noopener">Telegram<span>@kalvaaani</span></a>' +
    '<a role="menuitem" href="mailto:sophieekhasanova@gmail.com">Email<span>Gmail</span></a>';
  document.body.appendChild(menu);

  var menuButton = null;

  function closeMenu() {
    menu.classList.remove("open");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    menuButton = null;
  }

  document.querySelectorAll(".hcta").forEach(function (btn) {
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");
  });

  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest && e.target.closest(".hcta");
      if (btn) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (menuButton === btn) {
          closeMenu();
          return;
        }
        var rect = btn.getBoundingClientRect();
        menu.style.top = rect.bottom + 8 + "px";
        menu.style.right = Math.max(12, window.innerWidth - rect.right) + "px";
        menu.classList.add("open");
        menuButton = btn;
        btn.setAttribute("aria-expanded", "true");
        return;
      }
      if (menuButton && !menu.contains(e.target)) closeMenu();
      else if (menu.contains(e.target)) setTimeout(closeMenu, 50);
    },
    true,
  );

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener(
    "scroll",
    function () {
      if (menuButton) closeMenu();
    },
    { passive: true },
  );

  // anchor links: scroll with an offset for the sticky header
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href").slice(1);
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top;
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var offset = isMobile && top > 0 ? 16 : headerHeight + 24;
    var y = id === "top" ? 0 : top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", "#" + id);
  });

  // hero: Design / Build toggle
  var hero = document.querySelector("[data-mode]");
  if (hero) {
    var buttons = hero.querySelectorAll(".seg");
    function setMode(mode) {
      hero.className = mode === "design" ? "is-design" : "is-build";
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.dataset.set === mode);
      });
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.dataset.set);
      });
    });
    setMode("design");
  }

  // copy email button
  var copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      try {
        navigator.clipboard.writeText(copyBtn.dataset.copy);
      } catch (err) {}
      copyBtn.textContent = "Copied";
      setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 1600);
    });
  }
})();
