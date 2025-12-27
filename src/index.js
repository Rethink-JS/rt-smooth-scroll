(function () {
  var RT_NS = "rtSmoothScroll";
  if (window[RT_NS] && window[RT_NS].__initialized) return;

  function getAttrFrom(el, name) {
    if (!el) return null;
    if (!el.hasAttribute(name)) return null;
    return el.getAttribute(name);
  }

  function getAttr(name) {
    var html = document.documentElement;
    var body = document.body;
    var v = getAttrFrom(html, name);
    if (v !== null) return v;
    v = getAttrFrom(body, name);
    if (v !== null) return v;
    return null;
  }

  function hasAttrAnywhere(name) {
    var html = document.documentElement;
    var body = document.body;
    if (html && html.hasAttribute(name)) return true;
    if (body && body.hasAttribute(name)) return true;
    return false;
  }

  function parseBool(v, def) {
    if (v === null || v === undefined) return def;
    var s = String(v).trim().toLowerCase();
    if (s === "") return true;
    if (s === "true" || s === "1" || s === "yes" || s === "y" || s === "on")
      return true;
    if (s === "false" || s === "0" || s === "no" || s === "n" || s === "off")
      return false;
    return def;
  }

  function parseNum(v, def) {
    if (v === null || v === undefined) return def;
    var n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  function parseStr(v, def) {
    if (v === null || v === undefined) return def;
    var s = String(v);
    return s.length ? s : def;
  }

  function clamp01(t) {
    if (t < 0) return 0;
    if (t > 1) return 1;
    return t;
  }

  function easingByName(name) {
    var n = String(name || "").trim();
    if (!n) return null;
    var easings = {
      linear: function (t) {
        return clamp01(t);
      },
      easeInQuad: function (t) {
        t = clamp01(t);
        return t * t;
      },
      easeOutQuad: function (t) {
        t = clamp01(t);
        return t * (2 - t);
      },
      easeInOutQuad: function (t) {
        t = clamp01(t);
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      },
      easeInCubic: function (t) {
        t = clamp01(t);
        return t * t * t;
      },
      easeOutCubic: function (t) {
        t = clamp01(t);
        return 1 - Math.pow(1 - t, 3);
      },
      easeInOutCubic: function (t) {
        t = clamp01(t);
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
      easeInOutSine: function (t) {
        t = clamp01(t);
        return -(Math.cos(Math.PI * t) - 1) / 2;
      },
      easeOutExpo: function (t) {
        t = clamp01(t);
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      },
    };
    return easings[n] || null;
  }

  function hasAnyConfigOn(el) {
    if (!el) return false;
    for (var i = 0; i < el.attributes.length; i++) {
      var n = el.attributes[i].name;
      if (n && n.indexOf("rt-smooth-scroll-") === 0) return true;
    }
    return false;
  }

  function ensureDefaultsIfNeeded() {
    var body = document.body;
    var html = document.documentElement;
    if (!body) return;

    var instances = document.querySelectorAll("[rt-smooth-scroll-instance]");
    var hasInstances = instances && instances.length > 0;

    if (!hasAttrAnywhere("rt-smooth-scroll") && !hasInstances)
      body.setAttribute("rt-smooth-scroll", "");

    var configured = hasAnyConfigOn(html) || hasAnyConfigOn(body);
    if (configured || hasInstances) return;

    var defaults = {
      "rt-smooth-scroll-lerp": "0.25",
      "rt-smooth-scroll-orientation": "vertical",
      "rt-smooth-scroll-gesture-orientation": "vertical",
      "rt-smooth-scroll-normalize-wheel": "true",
      "rt-smooth-scroll-wheel-multiplier": "1",
      "rt-smooth-scroll-easing": "easeOutCubic",
      "rt-smooth-scroll-smooth-touch": "true",
      "rt-smooth-scroll-sync-touch": "true",
      "rt-smooth-scroll-sync-touch-lerp": "0",
      "rt-smooth-scroll-touch-inertia-multiplier": "10",
      "rt-smooth-scroll-touch-multiplier": "2",
    };

    for (var k in defaults) {
      if (!html.hasAttribute(k) && !body.hasAttribute(k))
        body.setAttribute(k, defaults[k]);
    }
  }

  function readOptions(getLocal) {
    var prefix = "rt-smooth-scroll-";

    function localOrGlobal(name) {
      var v = getLocal(name);
      if (v !== null && v !== undefined) return v;
      return getAttr(name);
    }

    var rawDuration = localOrGlobal(prefix + "duration");
    var rawLerp = localOrGlobal(prefix + "lerp");

    var hasDuration =
      rawDuration !== null &&
      rawDuration !== undefined &&
      String(rawDuration).trim() !== "";
    var hasLerp =
      rawLerp !== null &&
      rawLerp !== undefined &&
      String(rawLerp).trim() !== "";

    var duration = parseNum(rawDuration, 1.15);
    var lerp = parseNum(rawLerp, 0.25);

    if (hasDuration && !hasLerp) {
      lerp = 0;
    }

    var orientation = parseStr(
      localOrGlobal(prefix + "orientation"),
      "vertical"
    );
    var gestureOrientation = parseStr(
      localOrGlobal(prefix + "gesture-orientation"),
      "vertical"
    );
    var normalizeWheel = parseBool(
      localOrGlobal(prefix + "normalize-wheel"),
      true
    );
    var wheelMultiplier = parseNum(
      localOrGlobal(prefix + "wheel-multiplier"),
      1
    );
    var smoothTouch = parseBool(localOrGlobal(prefix + "smooth-touch"), true);
    var syncTouch = parseBool(localOrGlobal(prefix + "sync-touch"), true);
    var syncTouchLerp = parseNum(localOrGlobal(prefix + "sync-touch-lerp"), 0);
    var touchInertiaMultiplier = parseNum(
      localOrGlobal(prefix + "touch-inertia-multiplier"),
      10
    );
    var touchMultiplier = parseNum(
      localOrGlobal(prefix + "touch-multiplier"),
      2
    );
    var infinite = parseBool(localOrGlobal(prefix + "infinite"), false);

    var easingName = parseStr(localOrGlobal(prefix + "easing"), "easeOutCubic");
    var easingFn = easingByName(easingName);

    var opts = {
      lerp: lerp,
      orientation: orientation,
      gestureOrientation: gestureOrientation,
      normalizeWheel: normalizeWheel,
      wheelMultiplier: wheelMultiplier,
      smoothTouch: smoothTouch,
      syncTouch: syncTouch,
      syncTouchLerp: syncTouchLerp,
      touchInertiaMultiplier: touchInertiaMultiplier,
      touchMultiplier: touchMultiplier,
      infinite: infinite,
    };

    if (lerp === 0) {
      opts.duration = duration;
    }

    if (easingFn) opts.easing = easingFn;

    var extra = localOrGlobal(prefix + "options-json");
    if (extra) {
      try {
        var parsed = JSON.parse(extra);
        if (parsed && typeof parsed === "object") {
          for (var k in parsed) opts[k] = parsed[k];
        }
      } catch (e) {}
    }

    return opts;
  }

  function loadScriptOnce(src) {
    return new Promise(function (resolve, reject) {
      if (typeof window.Lenis !== "undefined") return resolve();
      var existing = document.querySelector('script[data-rt-lenis="true"]');
      if (existing) {
        existing.addEventListener("load", function () {
          resolve();
        });
        existing.addEventListener("error", function (e) {
          reject(e);
        });
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.dataset.rtLenis = "true";
      s.onload = function () {
        resolve();
      };
      s.onerror = function (e) {
        reject(e);
      };
      document.head.appendChild(s);
    });
  }

  function init() {
    ensureDefaultsIfNeeded();

    var enabledRoot = hasAttrAnywhere("rt-smooth-scroll");
    var instanceEls = document.querySelectorAll("[rt-smooth-scroll-instance]");
    var shouldRun = enabledRoot || (instanceEls && instanceEls.length > 0);
    if (!shouldRun) return;

    var lenisSrc = parseStr(
      getAttr("rt-smooth-scroll-lenis-src"),
      "https://cdn.jsdelivr.net/npm/lenis@1.3.16/dist/lenis.min.js"
    );

    var observeResize = parseBool(
      getAttr("rt-smooth-scroll-observe-resize"),
      true
    );
    var observeMutations = parseBool(
      getAttr("rt-smooth-scroll-observe-mutations"),
      true
    );
    var resizeDebounceMs = parseNum(
      getAttr("rt-smooth-scroll-resize-debounce-ms"),
      0
    );

    var state = {
      destroyed: false,
      rafId: 0,
      instances: {},
      order: [],
      observers: {},
      resizeTimers: {},
    };

    function scheduleResize(id) {
      var inst = state.instances[id];
      if (!inst || state.destroyed) return;
      if (resizeDebounceMs > 0) {
        clearTimeout(state.resizeTimers[id]);
        state.resizeTimers[id] = setTimeout(function () {
          var i2 = state.instances[id];
          if (!i2 || state.destroyed) return;
          i2.resize();
        }, resizeDebounceMs);
        return;
      }
      inst.resize();
    }

    function startRaf() {
      function raf(time) {
        if (state.destroyed) return;
        for (var i = 0; i < state.order.length; i++) {
          var id = state.order[i];
          var inst = state.instances[id];
          if (inst) inst.raf(time);
        }
        state.rafId = requestAnimationFrame(raf);
      }
      state.rafId = requestAnimationFrame(raf);
    }

    function addObservers(id, wrapperEl) {
      if (!wrapperEl || wrapperEl === window) return;

      var ro = null;
      var mo = null;

      if (observeResize && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(function () {
          scheduleResize(id);
        });
        ro.observe(wrapperEl);
      }

      if (observeMutations && typeof MutationObserver !== "undefined") {
        mo = new MutationObserver(function () {
          scheduleResize(id);
        });
        mo.observe(wrapperEl, { childList: true, subtree: true });
      }

      state.observers[id] = { ro: ro, mo: mo };
    }

    function removeObservers(id) {
      var obs = state.observers[id];
      if (!obs) return;
      if (obs.ro) obs.ro.disconnect();
      if (obs.mo) obs.mo.disconnect();
      delete state.observers[id];
    }

    function sanitizeOptionsForLog(opts) {
      var out = {};
      for (var k in opts) {
        if (!Object.prototype.hasOwnProperty.call(opts, k)) continue;
        var v = opts[k];
        if (typeof v === "function") {
          out[k] = "[Function]";
        } else {
          out[k] = v;
        }
      }
      return out;
    }

    function createInstance(id, wrapper, content, options) {
      var opts = options || {};
      if (wrapper) opts.wrapper = wrapper;
      if (content) opts.content = content;
      var inst = new window.Lenis(opts);
      state.instances[id] = inst;
      state.order.push(id);
      if (wrapper && wrapper !== window) addObservers(id, wrapper);
      if (id === "root") window.lenis = inst;

      try {
        console.log("[rt-smooth-scroll] instance:", id, {
          wrapper: wrapper === window ? "window" : wrapper,
          content: content || null,
          options: sanitizeOptionsForLog(opts),
        });
      } catch (e) {}

      return inst;
    }

    function getContentForWrapper(wrapperEl) {
      var selector = getAttrFrom(wrapperEl, "rt-smooth-scroll-content");
      if (selector) {
        var found = wrapperEl.querySelector(selector);
        if (found) return found;
      }
      return wrapperEl.firstElementChild || wrapperEl;
    }

    function makeApi() {
      function forEachTarget(id, fn) {
        if (typeof id === "string" && id.length) {
          var one = state.instances[id];
          if (one) fn(id, one);
          return;
        }
        for (var i = 0; i < state.order.length; i++) {
          var k = state.order[i];
          var inst = state.instances[k];
          if (inst) fn(k, inst);
        }
      }

      return {
        __initialized: true,
        ids: function () {
          return state.order.slice();
        },
        get: function (id) {
          return state.instances[id] || null;
        },
        start: function (id) {
          forEachTarget(id, function (_, inst) {
            inst.start();
          });
        },
        stop: function (id) {
          forEachTarget(id, function (_, inst) {
            inst.stop();
          });
        },
        toggle: function (id, force) {
          forEachTarget(id, function (_, inst) {
            if (typeof force === "boolean") {
              if (force) inst.stop();
              else inst.start();
              return;
            }
            if (inst.isStopped) inst.start();
            else inst.stop();
          });
        },
        resize: function (id) {
          forEachTarget(id, function (k) {
            scheduleResize(k);
          });
        },
        destroy: function (id) {
          if (state.destroyed) return;

          function destroyOne(k) {
            clearTimeout(state.resizeTimers[k]);
            removeObservers(k);
            var inst = state.instances[k];
            if (inst) {
              try {
                inst.destroy();
              } catch (e) {}
              delete state.instances[k];
            }
            var idx = state.order.indexOf(k);
            if (idx >= 0) state.order.splice(idx, 1);
            if (k === "root") {
              try {
                delete window.lenis;
              } catch (e) {
                window.lenis = undefined;
              }
            }
          }

          if (typeof id === "string" && id.length) {
            destroyOne(id);
            return;
          }

          while (state.order.length) destroyOne(state.order[0]);
          state.destroyed = true;
          if (state.rafId) cancelAnimationFrame(state.rafId);
        },
      };
    }

    function installLegacyAliases(api) {
      window.disableScroll = function () {
        api.stop();
        if (document.body) document.body.classList.add("no-scroll");
      };
      window.enableScroll = function () {
        api.start();
        if (document.body) document.body.classList.remove("no-scroll");
      };
    }

    loadScriptOnce(lenisSrc)
      .then(function () {
        if (state.destroyed) return;

        if (enabledRoot && !state.instances.root) {
          var optsRoot = readOptions(function () {
            return null;
          });
          createInstance("root", window, document.documentElement, optsRoot);
        }

        var els = document.querySelectorAll("[rt-smooth-scroll-instance]");
        var autoCount = 0;

        for (var i = 0; i < els.length; i++) {
          var el = els[i];
          var id = getAttrFrom(el, "rt-smooth-scroll-id");
          if (!id) {
            autoCount++;
            id = "instance-" + autoCount;
          }
          if (state.instances[id]) continue;

          var content = getContentForWrapper(el);

          var opts = readOptions(function (name) {
            return getAttrFrom(el, name);
          });
          createInstance(id, el, content, opts);
        }

        startRaf();

        var api = makeApi();
        window[RT_NS] = api;
        installLegacyAliases(api);

        window.addEventListener("resize", function () {
          api.resize();
        });
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window[RT_NS] = window[RT_NS] || {
    __initialized: true,
    ids: function () {
      return [];
    },
    get: function () {
      return null;
    },
  };
})();
