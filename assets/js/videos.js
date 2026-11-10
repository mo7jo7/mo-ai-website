/* ==========================================================================
   LiteAI Lab — video data + rendering, tag filtering and search
   --------------------------------------------------------------------------
   HOW TO UPDATE THE VIDEOS
   1. Open this file and find the `LITEAI_VIDEOS` object just below.
   2. Replace the `videos` array with the contents of your own JSON file
      (the same shape: id, title, description, thumbnail, url, date,
      duration, tags). Keep the `window.LITEAI_VIDEOS = ...;` wrapper.
   3. Save. Nothing else needs to change — filters, tag list, counts and the
      search index are all built automatically from this array.

   The data is embedded on purpose (no fetch/XHR) so the site works when
   index.html is opened straight from the file system (file://).

   NOTE: the 6 entries below are SAMPLE placeholders so the layout can be
   previewed. Their links point to the channel page. Replace them with your
   real videos.
   ========================================================================== */

window.LITEAI_VIDEOS = {
  "videos": [
    {
      "id": "sample-006",
      "title": "Sample video: Running a small language model on your own machine",
      "description": "Placeholder description. In this sample entry we walk through setting up a lightweight model locally, what hardware you need, and how to test it with a few prompts.\n\nReplace this text with the real description from your JSON file. Line breaks are preserved.",
      "thumbnail": "assets/generated/neural-network.jpg",
      "url": "https://www.youtube.com/@LiteAILab",
      "date": "2025-06-12",
      "duration": "14:20",
      "tags": ["tutorial", "local-ai", "beginner"]
    },
    {
      "id": "sample-005",
      "title": "Sample video: Comparing three AI coding assistants",
      "description": "Placeholder description. A side-by-side look at how different assistants handle the same small tasks, with notes on setup, speed and the kind of project each one suits.",
      "thumbnail": "assets/generated/circuit.jpg",
      "url": "https://www.youtube.com/@LiteAILab",
      "date": "2025-05-03",
      "duration": "18:45",
      "tags": ["review", "coding", "tools"]
    },
    {
      "id": "sample-004",
      "title": "Sample video: Prompt experiments you can repeat at home",
      "description": "Placeholder description. A set of simple, repeatable experiments that show how small changes in a prompt can change the result. Try them yourself and compare your findings.",
      "thumbnail": "assets/generated/waveform.jpg",
      "url": "https://www.youtube.com/@LiteAILab",
      "date": "2025-04-11",
      "duration": "09:58",
      "tags": ["experiment", "prompting", "beginner"]
    },
    {
      "id": "sample-003",
      "title": "Sample video: Packaging an AI demo with Docker",
      "description": "Placeholder description. Learn how to put a small AI demo into a container so it runs the same way everywhere, from your laptop to a server.",
      "thumbnail": "assets/generated/iso-cubes.jpg",
      "url": "https://www.youtube.com/@LiteAILab",
      "date": "2025-03-02",
      "duration": "22:10",
      "tags": ["tutorial", "docker", "deployment"]
    },
    {
      "id": "sample-002",
      "title": "Sample video: Five free tools for your AI workflow",
      "description": "Placeholder description. A quick tour of free and open tools that help with notes, automation and testing ideas faster.",
      "thumbnail": "assets/generated/hero-bg.jpg",
      "url": "https://www.youtube.com/@LiteAILab",
      "date": "2025-02-08",
      "duration": "11:32",
      "tags": ["tools", "productivity", "free"]
    },
    {
      "id": "sample-001",
      "title": "Sample video: Welcome to LiteAI Lab",
      "description": "Placeholder description. An introduction to the channel: what we cover, how videos are organised, and how to get the most out of the playlists.",
      "thumbnail": "assets/generated/neural-network.jpg",
      "url": "https://www.youtube.com/@LiteAILab",
      "date": "2025-01-15",
      "duration": "04:05",
      "tags": ["channel", "intro"]
    }
  ]
};

/* ==========================================================================
   Rendering, filtering and search
   ========================================================================== */
(function () {
  "use strict";

  var listEl = document.getElementById("video-list");
  if (!listEl) return; // only the home page has a video list

  var data = (window.LITEAI_VIDEOS && Array.isArray(window.LITEAI_VIDEOS.videos)) ? window.LITEAI_VIDEOS.videos : [];

  var searchEl = document.getElementById("video-search");
  var clearEl = document.getElementById("search-clear");
  var filtersEl = document.getElementById("tag-filters");
  var statusEl = document.getElementById("results-status");
  var countEl = document.getElementById("video-count");

  var state = { query: "", tag: "" };

  // Newest first (ISO dates sort lexicographically)
  var videos = data.slice().sort(function (a, b) {
    return String(b.date || "").localeCompare(String(a.date || ""));
  });

  // Pre-compute lowercase search text: title + description + tags
  videos.forEach(function (v) {
    v._tags = Array.isArray(v.tags) ? v.tags.map(String) : [];
    v._hay = (String(v.title || "") + " " + String(v.description || "") + " " + v._tags.join(" ")).toLowerCase();
  });

  /* ---------- helpers ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function svgIcon(path) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("class", "icon"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", path); s.appendChild(p);
    return s;
  }
  var ICON_CAL = "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm-2 8h14v9H5v-9z";
  var ICON_CLOCK = "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.1.8-1.3-4.5-2.7V7z";
  var ICON_PLAY = "M8 5v14l11-7z";

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!m) return String(iso || "");
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    try {
      return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
    } catch (e) { return String(iso); }
  }

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Append text to a node, wrapping query matches in <mark>
  function appendHighlighted(node, text, q) {
    if (!q) { node.appendChild(document.createTextNode(text)); return; }
    var re = new RegExp("(" + escapeRegExp(q) + ")", "gi");
    var parts = text.split(re);
    parts.forEach(function (part, i) {
      if (i % 2 === 1) node.appendChild(el("mark", { "class": "hl", text: part }));
      else if (part) node.appendChild(document.createTextNode(part));
    });
  }

  /* ---------- tag filter buttons ---------- */
  function buildFilters() {
    var counts = {};
    videos.forEach(function (v) { v._tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    var tags = Object.keys(counts).sort(function (a, b) { return a.localeCompare(b); });

    filtersEl.textContent = "";
    function mk(label, value, count) {
      var b = el("button", { type: "button", "class": "tag-filter", "data-tag": value, "aria-pressed": "false" });
      b.appendChild(document.createTextNode(label));
      if (count != null) b.appendChild(el("span", { "class": "count", text: "(" + count + ")" }));
      return b;
    }
    filtersEl.appendChild(mk("All", "", videos.length));
    tags.forEach(function (t) { filtersEl.appendChild(mk("#" + t, t, counts[t])); });
    syncFilterButtons();
  }

  function syncFilterButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tag]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-tag") === state.tag ? "true" : "false");
    });
  }

  /* ---------- card ---------- */
  function card(v, q) {
    var title = String(v.title || "Untitled");
    var url = String(v.url || (v.id ? "https://www.youtube.com/watch?v=" + v.id : window.SITE_CONFIG.channelUrl));

    var img = el("img", {
      src: String(v.thumbnail || ""), alt: "Thumbnail for: " + title, loading: "lazy", decoding: "async"
    });
    img.addEventListener("error", function () {
      img.onerror = null; img.src = "assets/generated/hero-bg.jpg";
    });
    var thumbKids = [img];
    if (v.duration) thumbKids.push(el("span", { "class": "duration", text: String(v.duration) }));
    var thumb = el("a", { "class": "thumb-link", href: url, target: "_blank", rel: "noopener noreferrer", "aria-label": "Watch on YouTube: " + title }, thumbKids);

    var h3 = el("h3");
    var tl = el("a", { href: url, target: "_blank", rel: "noopener noreferrer", style: "color:inherit;text-decoration:none" });
    appendHighlighted(tl, title, q);
    h3.appendChild(tl);

    var meta = el("div", { "class": "video-meta" }, [
      el("span", {}, [svgIcon(ICON_CAL), el("time", { datetime: String(v.date || ""), text: formatDate(v.date) })]),
      v.duration ? el("span", {}, [svgIcon(ICON_CLOCK), el("span", { text: "Duration " + v.duration })]) : null
    ]);

    var desc = el("p", { "class": "video-desc" });
    appendHighlighted(desc, String(v.description || ""), q);

    var tagList = el("ul", { "class": "video-tags", "aria-label": "Tags" });
    v._tags.forEach(function (t) {
      var b = el("button", { type: "button", "class": "tag", "data-tag": t, "aria-pressed": state.tag === t ? "true" : "false", "aria-label": "Filter by tag " + t });
      b.textContent = "#" + t;
      tagList.appendChild(el("li", {}, [b]));
    });

    var watch = el("a", { "class": "btn btn-primary btn-sm", href: url, target: "_blank", rel: "noopener noreferrer" }, [
      svgIcon(ICON_PLAY), document.createTextNode("Watch on YouTube")
    ]);

    var info = el("div", { "class": "video-info" }, [h3, meta, desc, v._tags.length ? tagList : null, watch]);
    return el("li", {}, [el("article", { "class": "video-card reveal" }, [thumb, info])]);
  }

  /* ---------- render ---------- */
  function matches(v) {
    if (state.tag && v._tags.indexOf(state.tag) === -1) return false;
    if (state.query) {
      // every word the visitor typed must appear in title, description or tags
      var words = state.query.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) { if (v._hay.indexOf(words[i]) === -1) return false; }
    }
    return true;
  }

  function render() {
    var q = state.query.trim();
    var shown = videos.filter(matches);
    listEl.textContent = "";

    // highlight only the first word to keep markup simple and safe
    var hl = q ? q.split(/\s+/)[0] : "";
    shown.forEach(function (v) { listEl.appendChild(card(v, hl)); });

    if (!shown.length) {
      listEl.appendChild(el("li", {}, [
        el("div", { "class": "empty-state" }, [
          el("p", { text: "No videos match your search." }),
          (function () {
            var b = el("button", { type: "button", "class": "btn btn-ghost btn-sm", id: "reset-filters", text: "Clear search and filters" });
            return b;
          })()
        ])
      ]));
    }

    var label = shown.length === videos.length
      ? "Showing all " + videos.length + " video" + (videos.length === 1 ? "" : "s")
      : "Showing " + shown.length + " of " + videos.length + " videos";
    if (state.tag) label += " tagged #" + state.tag;
    if (q) label += " matching “" + q + "”";
    statusEl.textContent = label + ".";
    if (countEl) countEl.textContent = String(videos.length);
    clearEl.classList.toggle("visible", !!state.query);
    syncFilterButtons();
    if (window.LiteAIReveal) window.LiteAIReveal(listEl);
  }

  /* ---------- events ---------- */
  var timer = null;
  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  });
  clearEl.addEventListener("click", function () { searchEl.value = ""; state.query = ""; render(); searchEl.focus(); });

  // Delegated clicks: filter buttons, tag badges inside cards, and the reset button
  document.getElementById("videos").addEventListener("click", function (e) {
    var tagBtn = e.target.closest("[data-tag]");
    if (tagBtn) {
      var t = tagBtn.getAttribute("data-tag");
      state.tag = (state.tag === t) ? "" : t; // clicking the active tag again clears it
      render();
      if (tagBtn.closest(".video-card")) {
        var top = document.getElementById("tag-filters");
        if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "center" });
      }
      return;
    }
    if (e.target.closest("#reset-filters")) {
      state.query = ""; state.tag = ""; searchEl.value = ""; render();
    }
  });

  buildFilters();
  render();
})();
