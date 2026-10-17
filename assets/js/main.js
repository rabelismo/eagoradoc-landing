(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var kiwify = cfg.kiwify || {};
  var wa = cfg.whatsapp || {};
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function isUrl(v) { return typeof v === "string" && /^https:\/\/\S+$/.test(v.trim()); }

  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 5000);
  }

  function markPending(el, msg) {
    el.classList.add("is-pending");
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("title", "Link ainda não configurado");
    el.addEventListener("click", function (e) { e.preventDefault(); toast(msg); });
  }

  // ---- links de compra (Kiwify) ----
  var missing = [];
  document.querySelectorAll("[data-checkout]").forEach(function (el) {
    var key = el.getAttribute("data-checkout");
    var url = kiwify[key];
    if (isUrl(url)) {
      el.href = url.trim();
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    } else {
      if (missing.indexOf(key) === -1) missing.push(key);
      markPending(el, "Link de compra ainda não configurado. Preencha <code>kiwify." + key + "</code> em <code>assets/js/config.js</code>.");
    }
  });

  // ---- WhatsApp ----
  var numero = String(wa.numero || "").replace(/\D/g, "");
  var waHref = isUrl(wa.link) ? wa.link.trim()
    : numero.length >= 12 ? "https://wa.me/" + numero + (wa.mensagem ? "?text=" + encodeURIComponent(wa.mensagem) : "")
    : "";
  var waOk = !!waHref;
  document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
    if (waOk) {
      el.href = waHref;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    } else {
      markPending(el,"WhatsApp ainda não configurado. Preencha <code>whatsapp.numero</code> em <code>assets/js/config.js</code>.");
    }
  });

  if (missing.length || !waOk) {
    var parts = [];
    if (missing.length) parts.push(missing.length + " link(s) da Kiwify");
    if (!waOk) parts.push("o WhatsApp");
    var banner = document.getElementById("config-banner");
    banner.innerHTML = "Site em configuração: falta preencher " + parts.join(" e ") + " em <code>assets/js/config.js</code>. Os botões marcados como “link pendente” ainda não funcionam.";
    banner.hidden = false;
  }

  // ---- cabeçalho / menu ----
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("main-nav");
  var toggle = document.getElementById("nav-toggle");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !nav.classList.contains("is-open")) return;
    var focusInNav = nav.contains(document.activeElement);
    setMenu(false);
    if (focusInNav) toggle.focus();
  });

  // ---- carrosséis ----
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-carousel-nav]").forEach(function (navEl) {
    var track = document.getElementById(navEl.getAttribute("data-carousel-nav"));
    var btns = navEl.querySelectorAll("button");
    function step() {
      var item = track.firstElementChild;
      return item ? item.getBoundingClientRect().width + 20 : track.clientWidth;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      btns[0].disabled = track.scrollLeft <= 2;
      btns[1].disabled = track.scrollLeft >= max;
      navEl.style.visibility = max <= 0 ? "hidden" : "";
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        track.scrollBy({ left: step() * Number(b.getAttribute("data-dir")), behavior: reduceMotion.matches ? "auto" : "smooth" });
      });
    });
    var resizeFrame = 0;
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", function () {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(update);
    });
    update();
  });

  // ---- galeria: filtros ----
  var gallery = document.getElementById("gallery");
  var moreBtn = document.getElementById("gallery-more");
  var extraCount = gallery.querySelectorAll("li.is-extra").length;
  var filterBtns = document.querySelectorAll(".filter");
  var activeFilter = "all";
  var expanded = false;

  function setFilter(name) {
    activeFilter = name;
    filterBtns.forEach(function (o) {
      var on = o.getAttribute("data-filter") === name;
      o.classList.toggle("is-active", on);
      o.setAttribute("aria-pressed", String(on));
    });
  }

  function applyGallery() {
    gallery.querySelectorAll("li").forEach(function (li) {
      var tags = li.getAttribute("data-module").split(" ");
      li.hidden = activeFilter === "all"
        ? (!expanded && li.classList.contains("is-extra"))
        : tags.indexOf(activeFilter) === -1;
    });
    moreBtn.hidden = activeFilter !== "all";
    moreBtn.setAttribute("aria-expanded", String(expanded));
    moreBtn.textContent = expanded ? "Mostrar menos" : "Ver mais amostras (" + extraCount + ")";
  }

  filterBtns.forEach(function (f) {
    f.addEventListener("click", function () {
      setFilter(f.getAttribute("data-filter"));
      applyGallery();
      var url = new URL(window.location.href);
      if (activeFilter === "all") url.searchParams.delete("filtro");
      else url.searchParams.set("filtro", activeFilter);
      history.replaceState(null, "", url);
    });
  });
  var initialFilter = new URLSearchParams(window.location.search).get("filtro");
  if (initialFilter && document.querySelector('.filter[data-filter="' + CSS.escape(initialFilter) + '"]')) setFilter(initialFilter);
  moreBtn.addEventListener("click", function () {
    expanded = !expanded;
    applyGallery();
    if (!expanded) document.getElementById("por-dentro").scrollIntoView();
  });
  applyGallery();

  // ---- lightbox ----
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-cap");
  var samples = Array.prototype.slice.call(gallery.querySelectorAll("[data-sample]"));
  var current = 0;
  var lastFocus = null;

  function visibleSamples() {
    return samples.filter(function (b) { return !b.closest("li").hidden; });
  }
  function show(btn) {
    current = samples.indexOf(btn);
    lb.classList.add("is-loading");
    lbImg.src = "assets/img/amostras/" + btn.getAttribute("data-sample") + ".jpg";
    lbImg.alt = btn.querySelector("img").alt;
    lbCap.textContent = btn.getAttribute("data-caption") + " · amostra";
  }
  function open(btn) {
    lastFocus = document.activeElement;
    show(btn);
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function close() {
    if (typeof lb.close === "function") lb.close(); else lb.removeAttribute("open");
  }
  lb.addEventListener("close", function () {
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  });
  function move(dir) {
    var vis = visibleSamples();
    var i = vis.indexOf(samples[current]);
    show(vis[(i + dir + vis.length) % vis.length]);
  }

  samples.forEach(function (b) { b.addEventListener("click", function () { open(b); }); });
  document.querySelectorAll("[data-open-sample]").forEach(function (b) {
    b.addEventListener("click", function () {
      var target = gallery.querySelector('[data-sample="' + b.getAttribute("data-open-sample") + '"]');
      if (target) open(target);
    });
  });
  lb.addEventListener("click", function (e) {
    var ctl = e.target.closest("[data-lb]");
    if (ctl) {
      var v = ctl.getAttribute("data-lb");
      if (v === "close") close(); else move(Number(v));
    } else if (e.target === lb || e.target.classList.contains("lb-inner")) {
      close();
    }
  });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") move(1);
    if (e.key === "ArrowLeft") move(-1);
  });
  lbImg.addEventListener("load", function () { lb.classList.remove("is-loading"); });
  lbImg.addEventListener("error", function () { lb.classList.remove("is-loading"); });
  lbImg.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // ---- entrada das seções ----
  var revealBlocks = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    revealBlocks.forEach(function (block) {
      Array.prototype.forEach.call(block.children, function (child, i) {
        child.style.setProperty("--d", String(Math.min(i, 8)));
      });
    });
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    revealBlocks.forEach(function (block) {
      if (block.getBoundingClientRect().top < window.innerHeight) block.classList.add("is-in");
      else revealObserver.observe(block);
    });
    document.documentElement.classList.add("reveal-ready");
  }

  // ---- capas do topo acompanham a rolagem ----
  var heroVisual = document.querySelector(".hero-visual");
  if (heroVisual && !reduceMotion.matches) {
    var heroFrame = 0;
    window.addEventListener("scroll", function () {
      cancelAnimationFrame(heroFrame);
      heroFrame = requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        heroVisual.style.transform = "translateY(" + (y * -0.08).toFixed(1) + "px) rotate(" + (y * 0.002).toFixed(3) + "deg)";
      });
    }, { passive: true });
  }

  // ---- ano ----
  document.getElementById("year").textContent = new Date().getFullYear();
})();
