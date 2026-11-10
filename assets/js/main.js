/* ==========================================================================
   LiteAI Lab — site-wide behaviour (theme, menu, reveal-on-scroll, contact form)
   Vanilla JS, no dependencies, works from file:// and GitHub Pages.
   ========================================================================== */

/* ---- Site configuration: edit these values ------------------------------ */
window.SITE_CONFIG = {
  channelUrl: "https://www.youtube.com/@LiteAILab",
  // Contact form: "mailto" (opens the visitor's email app) or "formspree".
  contactMode: "mailto",
  contactEmail: "contact@example.com",   // <-- replace with your real address (used by mailto mode)
  formspreeEndpoint: ""                  // e.g. "https://formspree.io/f/xxxxxxxx" (used when contactMode = "formspree")
};

(function () {
  "use strict";

  var root = document.documentElement;

  function safeGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { window.localStorage.setItem(key, val); } catch (e) { /* ignore */ } }

  /* ---- Theme toggle (dark by default) ---- */
  var toggle = document.getElementById("theme-toggle");
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      toggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f7f7fb" : "#0b0d17");
  }
  applyTheme(root.getAttribute("data-theme") || "dark");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      safeSet("liteai-theme", next);
    });
  }

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById("menu-toggle");
  var menu = document.getElementById("primary-nav");
  if (menuBtn && menu) {
    function setMenu(open) {
      menu.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Fade-in on scroll (disabled for reduced motion) ---- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var observer = null;
  if ("IntersectionObserver" in window && !reduce) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); observer.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  }
  window.LiteAIReveal = function (scope) {
    var nodes = (scope || document).querySelectorAll(".reveal:not(.in)");
    Array.prototype.forEach.call(nodes, function (n) {
      if (observer) observer.observe(n); else n.classList.add("in");
    });
  };
  window.LiteAIReveal();

  /* ---- Contact form ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var cfg = window.SITE_CONFIG;

    function show(msg, ok) {
      status.textContent = msg;
      status.className = "form-status show " + (ok ? "ok" : "err");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      if (data.get("company")) return; // honeypot: bots fill this in

      var name = String(data.get("name") || "").trim();
      var email = String(data.get("email") || "").trim();
      var topic = String(data.get("topic") || "General");
      var message = String(data.get("message") || "").trim();

      if (cfg.contactMode === "formspree" && cfg.formspreeEndpoint) {
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        fetch(cfg.formspreeEndpoint, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: data
        }).then(function (r) {
          if (!r.ok) throw new Error("Request failed");
          form.reset();
          show("Thanks! Your message was sent.", true);
        }).catch(function () {
          show("Sorry, something went wrong. Please try again or email us directly.", false);
        }).then(function () { btn.disabled = false; });
        return;
      }

      // mailto fallback
      var subject = "[LiteAI Lab] " + topic + " - " + name;
      var body = message + "\n\n--\nFrom: " + name + " <" + email + ">";
      window.location.href = "mailto:" + encodeURIComponent(cfg.contactEmail).replace("%40", "@") +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      show("Your email app should open with the message ready to send. If nothing happens, email " + cfg.contactEmail + " directly.", true);
    });
  }
})();
