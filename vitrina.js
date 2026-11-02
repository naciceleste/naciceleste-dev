/* ☁️ naciceleste.dev — vitrina
   La página se arma sola desde este array: para sumar un proyecto, agregá un
   objeto acá y listo. Las tarjetas se dibujan a lo largo de un camino punteado
   que una estrellita pastel recorre al bajar. Sin JS se ven las tarjetas del
   <noscript> en el HTML; con "movimiento reducido" se ven quietas y completas. */

var PROYECTOS = [
  {
    num: 1,
    shot: "assets/shot-biblioteca.webp",
    shotAlt: "Captura de la Biblioteca pública de naciceleste",
    name: "Biblioteca pública",
    desc: "Todo lo que me gusta, guardado en un solo lugar: posts de X, Instagram, YouTube y TikTok.",
    cta: "Entrar a la biblioteca",
    url: "https://biblioteca.naciceleste.dev/",
    accent: "celeste"
  },
  {
    num: 2,
    shot: "assets/shot-guia.webp",
    shotAlt: "Captura de la Guía de TV de naciceleste",
    name: "Guía de TV",
    desc: "Mi guía de programación para no perderme nada. Está protegida con clave.",
    tag: { text: "con clave", lock: true },
    cta: "Abrir la guía",
    url: "https://guia.naciceleste.dev/",
    accent: "lila"
  },
  {
    num: 3,
    cover: "diary",
    name: "Diario online",
    desc: "Un feed de noticias de mis intereses, armado con la calma de un diario de toda la vida.",
    tag: { text: "pronto", soon: true },
    soon: "Muy pronto ☁️",
    accent: "pink"
  }
];

(function () {
  "use strict";

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  document.addEventListener("DOMContentLoaded", function () {
    renderSteps();
    setupTheme();
    setupToTop();

    var journey = document.getElementById("recorrido");
    var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
    if (!journey || !steps.length) return;

    // El camino es plano JS (no depende de GSAP): se dibuja igual.
    buildPath();

    var onResize = debounce(function () {
      buildPath();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 180);
    window.addEventListener("resize", onResize);
    // reposicionar cuando terminen de cargar fuentes/imágenes (cambian alturas)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
    window.addEventListener("load", onResize);

    if (window.gsap && window.ScrollTrigger && !reduce) {
      gsap.registerPlugin(ScrollTrigger);
      animate(journey, steps);
    } else {
      // sin GSAP o con movimiento reducido: trail completo y estrellita en la última parada
      placeTraveller(1);
    }
  });

  /* ---------- armar las tarjetas desde PROYECTOS ---------- */
  function renderSteps() {
    var ol = document.getElementById("steps");
    if (!ol) return;
    var frag = document.createDocumentFragment();

    PROYECTOS.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "step";

      var card = document.createElement("article");
      card.className = "step-card accent-" + (p.accent || "celeste") + (p.soon ? " is-soon" : "");

      var num = document.createElement("div");
      num.className = "step-num";
      num.textContent = p.num;

      var media = buildMedia(p);

      var h = document.createElement("h3");
      h.className = "step-name";
      h.appendChild(document.createTextNode(p.name));
      if (p.tag) h.appendChild(buildTag(p.tag));

      var desc = document.createElement("p");
      desc.className = "step-desc";
      desc.textContent = p.desc;

      var cta;
      if (p.soon) {
        cta = document.createElement("span");
        cta.className = "step-cta is-disabled";
        cta.textContent = p.soon;
      } else {
        cta = document.createElement("a");
        cta.className = "step-cta";
        cta.href = p.url;
        cta.target = "_blank";
        cta.rel = "noopener";
        cta.appendChild(document.createTextNode(p.cta || "Abrir"));
        cta.appendChild(svgUse("#i-arrow"));
      }

      card.appendChild(num);
      card.appendChild(media);
      card.appendChild(h);
      card.appendChild(desc);
      card.appendChild(cta);
      li.appendChild(card);
      frag.appendChild(li);
    });

    ol.innerHTML = "";
    ol.appendChild(frag);
  }

  /* miniatura real (webp) o, para el proyecto "muy pronto", la portada del diario */
  function buildMedia(p) {
    var box = document.createElement("div");
    box.className = "step-thumb";
    if (p.shot) {
      var img = document.createElement("img");
      img.src = p.shot;
      img.alt = p.shotAlt || "";
      img.setAttribute("loading", "lazy");
      img.setAttribute("width", "800");
      img.setAttribute("height", "500");
      box.appendChild(img);
    } else if (p.cover === "diary") {
      box.className += " step-thumb-soon";
      box.setAttribute("aria-hidden", "true");
      box.appendChild(svgUse("#diary-cover", "0 0 800 500"));
    } else {
      box.className = "step-icon";
      box.setAttribute("aria-hidden", "true");
      box.textContent = p.icon || "✨";
    }
    return box;
  }

  function buildTag(tag) {
    var s = document.createElement("span");
    s.className = "step-tag" + (tag.soon ? " soon" : "");
    if (tag.lock) s.appendChild(svgUse("#i-lock"));
    s.appendChild(document.createTextNode(tag.text));
    return s;
  }

  function svgUse(href, viewBox) {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", viewBox || "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(SVGNS, "use");
    use.setAttribute("href", href);
    svg.appendChild(use);
    return svg;
  }

  /* ---------- dibujar el camino punteado entre los badges ---------- */
  function buildPath() {
    var journey = document.getElementById("recorrido");
    var svg = document.getElementById("path-svg");
    var base = document.getElementById("path-base");
    var trail = document.getElementById("path-trail");
    if (!journey || !svg || !base) return;

    var jr = journey.getBoundingClientRect();
    var W = journey.clientWidth, H = journey.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    var badges = journey.querySelectorAll(".step-num");
    var pts = [];
    for (var i = 0; i < badges.length; i++) {
      var b = badges[i].getBoundingClientRect();
      pts.push({ x: b.left - jr.left + b.width / 2, y: b.top - jr.top + b.height / 2 });
    }
    if (pts.length < 2) return;

    // extender antes de la primera parada (sin meterse en la intro) y después de la última
    var first = pts[0], last = pts[pts.length - 1];
    var intro = journey.querySelector(".journey-intro");
    var introBottom = 0;
    if (intro) {
      var ir = intro.getBoundingClientRect();
      introBottom = ir.bottom - jr.top;
    }
    var startY = Math.max(introBottom + 24, first.y - 150);
    startY = Math.min(startY, first.y - 24);
    pts.unshift({ x: first.x, y: startY });
    pts.push({ x: last.x, y: Math.min(H, last.y + 150) });

    var d = smooth(pts);
    base.setAttribute("d", d);
    if (trail) trail.setAttribute("d", d);
  }

  // Catmull-Rom → curva de Bézier suave
  function smooth(p) {
    if (p.length < 2) return "";
    var d = "M" + r(p[0].x) + " " + r(p[0].y);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += "C" + r(c1x) + " " + r(c1y) + " " + r(c2x) + " " + r(c2y) + " " + r(p2.x) + " " + r(p2.y);
    }
    return d;
  }
  function r(n) { return Math.round(n * 10) / 10; }

  /* ---------- posicionar la estrellita a lo largo del camino (0..1) ---------- */
  function placeTraveller(p) {
    var base = document.getElementById("path-base");
    var trail = document.getElementById("path-trail");
    var star = document.getElementById("traveller");
    if (!base || !star) return;
    var L = base.getTotalLength();
    if (!L) return;

    p = Math.max(0, Math.min(1, p));
    var pt = base.getPointAtLength(L * p);

    // la estrellita queda derechita (no rota según la dirección)
    star.style.left = pt.x + "px";
    star.style.top = pt.y + "px";

    // la estela se dibuja detrás de la estrellita
    if (trail) {
      trail.style.strokeDasharray = L;
      trail.style.strokeDashoffset = L * (1 - p);
    }
  }

  /* ---------- animaciones con GSAP ---------- */
  function animate(journey, steps) {
    // entrada de cada tarjeta
    steps.forEach(function (s) {
      gsap.set(s, { autoAlpha: 0, y: 36 });
      ScrollTrigger.create({
        trigger: s,
        start: "top 84%",
        once: true,
        onEnter: function () {
          gsap.to(s, { autoAlpha: 1, y: 0, duration: .7, ease: "power3.out" });
        }
      });
    });

    // la estrellita recorre el camino según el scroll
    placeTraveller(0);
    ScrollTrigger.create({
      trigger: journey,
      start: "top 72%",
      end: "bottom 85%",
      scrub: .4,
      onUpdate: function (self) { placeTraveller(self.progress); }
    });

    // el fondo cambia de color al bajar (celeste → rosa → lila)
    var rosa = document.querySelector(".flow-rosa");
    var lila = document.querySelector(".flow-lila");
    if (rosa && lila) {
      ScrollTrigger.create({
        trigger: journey,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: function (self) {
          var p = self.progress;
          rosa.style.opacity = clamp01(p / 0.6);
          lila.style.opacity = clamp01((p - 0.4) / 0.6);
        }
      });
    }
  }

  function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

  /* ---------- botón de tema (día/noche) ---------- */
  function setupTheme() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    sync();
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("tema2", next); } catch (e) {}
      sync();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
    function sync() {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }
  }

  /* ---------- botón "volver arriba" ---------- */
  function setupToTop() {
    var btn = document.getElementById("to-top");
    if (!btn) return;
    var onScroll = debounce(function () {
      btn.hidden = window.scrollY < 600;
    }, 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      var a = arguments, c = this;
      t = setTimeout(function () { fn.apply(c, a); }, ms);
    };
  }
})();
