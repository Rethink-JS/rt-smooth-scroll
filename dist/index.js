/*! @rethink-js/rt-smooth-scroll v1.1.0 | MIT */
(() => {
  // src/index.js
  (function() {
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
      if (v === null || v === void 0) return def;
      var s = String(v).trim().toLowerCase();
      if (s === "") return true;
      if (s === "true" || s === "1" || s === "yes" || s === "y" || s === "on")
        return true;
      if (s === "false" || s === "0" || s === "no" || s === "n" || s === "off")
        return false;
      return def;
    }
    function parseNum(v, def) {
      if (v === null || v === void 0) return def;
      var s = String(v).trim();
      if (!s.length) return def;
      var n = Number(s);
      return Number.isFinite(n) ? n : def;
    }
    function parseStr(v, def) {
      if (v === null || v === void 0) return def;
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
        linear: function(t) {
          return clamp01(t);
        },
        easeInQuad: function(t) {
          t = clamp01(t);
          return t * t;
        },
        easeOutQuad: function(t) {
          t = clamp01(t);
          return t * (2 - t);
        },
        easeInOutQuad: function(t) {
          t = clamp01(t);
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        },
        easeInCubic: function(t) {
          t = clamp01(t);
          return t * t * t;
        },
        easeOutCubic: function(t) {
          t = clamp01(t);
          return 1 - Math.pow(1 - t, 3);
        },
        easeInOutCubic: function(t) {
          t = clamp01(t);
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },
        easeInOutSine: function(t) {
          t = clamp01(t);
          return -(Math.cos(Math.PI * t) - 1) / 2;
        },
        easeOutExpo: function(t) {
          t = clamp01(t);
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }
      };
      return easings[n] || null;
    }
    function ensureAutoEnableIfNeeded() {
      var body = document.body;
      if (!body) return;
      var instances = document.querySelectorAll("[rt-smooth-scroll-instance]");
      var hasInstances = instances && instances.length > 0;
      if (!hasAttrAnywhere("rt-smooth-scroll") && !hasInstances) {
        body.setAttribute("rt-smooth-scroll", "");
      }
    }
    function isAttrPresent(v) {
      return v !== null && v !== void 0;
    }
    function readOptions(getLocal) {
      var prefix = "rt-smooth-scroll-";
      function localOrGlobal(name) {
        var v = getLocal(name);
        if (isAttrPresent(v)) return v;
        return getAttr(name);
      }
      function getRaw(name) {
        return localOrGlobal(prefix + name);
      }
      function hasRaw(name) {
        return isAttrPresent(getRaw(name));
      }
      var opts = {};
      var hasLerp = hasRaw("lerp");
      var lerp = parseNum(getRaw("lerp"), void 0);
      var hasDuration = hasRaw("duration");
      var duration = parseNum(getRaw("duration"), void 0);
      var hasEasing = hasRaw("easing");
      var easingName = parseStr(getRaw("easing"), "");
      var easingFn = easingByName(easingName);
      if (hasLerp && lerp !== void 0) {
        opts.lerp = lerp;
      } else {
        if (hasDuration && duration !== void 0) opts.duration = duration;
        if (hasEasing && easingFn) opts.easing = easingFn;
      }
      if (hasRaw("orientation")) {
        var orientation = parseStr(getRaw("orientation"), "");
        if (orientation) opts.orientation = orientation;
      }
      if (hasRaw("gesture-orientation")) {
        var gestureOrientation = parseStr(getRaw("gesture-orientation"), "");
        if (gestureOrientation) opts.gestureOrientation = gestureOrientation;
      }
      var smoothWheelRaw = getRaw("smooth-wheel");
      var normalizeWheelRaw = getRaw("normalize-wheel");
      if (isAttrPresent(smoothWheelRaw)) {
        opts.smoothWheel = parseBool(smoothWheelRaw, true);
      } else if (isAttrPresent(normalizeWheelRaw)) {
        opts.smoothWheel = parseBool(normalizeWheelRaw, true);
      }
      if (hasRaw("wheel-multiplier")) {
        var wheelMultiplier = parseNum(getRaw("wheel-multiplier"), void 0);
        if (wheelMultiplier !== void 0) opts.wheelMultiplier = wheelMultiplier;
      }
      if (hasRaw("touch-multiplier")) {
        var touchMultiplier = parseNum(getRaw("touch-multiplier"), void 0);
        if (touchMultiplier !== void 0) opts.touchMultiplier = touchMultiplier;
      }
      if (hasRaw("sync-touch")) {
        opts.syncTouch = parseBool(getRaw("sync-touch"), false);
      }
      if (hasRaw("sync-touch-lerp")) {
        var syncTouchLerp = parseNum(getRaw("sync-touch-lerp"), void 0);
        if (syncTouchLerp !== void 0) opts.syncTouchLerp = syncTouchLerp;
      }
      if (hasRaw("touch-inertia-exponent")) {
        var tie = parseNum(getRaw("touch-inertia-exponent"), void 0);
        if (tie !== void 0) opts.touchInertiaExponent = tie;
      }
      if (hasRaw("infinite")) {
        opts.infinite = parseBool(getRaw("infinite"), false);
      }
      if (hasRaw("auto-resize")) {
        opts.autoResize = parseBool(getRaw("auto-resize"), true);
      }
      if (hasRaw("overscroll")) {
        opts.overscroll = parseBool(getRaw("overscroll"), true);
      }
      if (hasRaw("anchors")) {
        var anchorsRaw = getRaw("anchors");
        var s = String(anchorsRaw || "").trim();
        if (s === "" || s.toLowerCase() === "true") {
          opts.anchors = true;
        } else if (s.toLowerCase() === "false") {
          opts.anchors = false;
        } else {
          try {
            opts.anchors = JSON.parse(s);
          } catch (e) {
            opts.anchors = true;
          }
        }
      }
      if (hasRaw("auto-toggle")) {
        opts.autoToggle = parseBool(getRaw("auto-toggle"), false);
      }
      if (hasRaw("allow-nested-scroll")) {
        opts.allowNestedScroll = parseBool(getRaw("allow-nested-scroll"), false);
      }
      var extra = localOrGlobal(prefix + "options-json");
      if (extra) {
        try {
          var parsed = JSON.parse(extra);
          if (parsed && typeof parsed === "object") {
            for (var k in parsed) opts[k] = parsed[k];
          }
        } catch (e) {
        }
      }
      return opts;
    }
    function loadScriptOnce(src) {
      return new Promise(function(resolve, reject) {
        if (typeof window.Lenis !== "undefined") return resolve();
        var existing = document.querySelector('script[data-rt-lenis="true"]');
        if (existing) {
          existing.addEventListener("load", function() {
            resolve();
          });
          existing.addEventListener("error", function(e) {
            reject(e);
          });
          return;
        }
        var s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.dataset.rtLenis = "true";
        s.onload = function() {
          resolve();
        };
        s.onerror = function(e) {
          reject(e);
        };
        document.head.appendChild(s);
      });
    }
    function init() {
      ensureAutoEnableIfNeeded();
      var enabledRoot = hasAttrAnywhere("rt-smooth-scroll");
      var instanceEls = document.querySelectorAll("[rt-smooth-scroll-instance]");
      var hasInstances = instanceEls && instanceEls.length > 0;
      var shouldRun = enabledRoot || hasInstances;
      if (!shouldRun) return;
      var lenisSrc = parseStr(
        getAttr("rt-smooth-scroll-lenis-src"),
        "https://cdn.jsdelivr.net/npm/lenis@1.3.16/dist/lenis.min.js"
      );
      var resizeDebounceMs = parseNum(
        getAttr("rt-smooth-scroll-resize-debounce-ms"),
        0
      );
      var debug = parseBool(getAttr("rt-smooth-scroll-debug"), true);
      var state = {
        destroyed: false,
        rafId: 0,
        instances: {},
        order: [],
        resizeTimers: {}
      };
      function scheduleResize(id) {
        var inst = state.instances[id];
        if (!inst || state.destroyed) return;
        if (resizeDebounceMs > 0) {
          clearTimeout(state.resizeTimers[id]);
          state.resizeTimers[id] = setTimeout(function() {
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
      function sanitizeOptionsForLog(opts) {
        var out = {};
        for (var k in opts) {
          if (!Object.prototype.hasOwnProperty.call(opts, k)) continue;
          var v = opts[k];
          if (typeof v === "function") out[k] = "[Function]";
          else out[k] = v;
        }
        return out;
      }
      function resolveElementFromSelector(base, selector) {
        if (!selector) return null;
        var s = String(selector).trim();
        if (!s.length) return null;
        if (s === "window") return window;
        try {
          return (base || document).querySelector(s);
        } catch (e) {
          return null;
        }
      }
      function applySelectorsToOptions(el, opts) {
        var prefix = "rt-smooth-scroll-";
        var wrapperSel = getAttrFrom(el, prefix + "wrapper");
        var contentSel = getAttrFrom(el, prefix + "content");
        var eventsSel = getAttrFrom(el, prefix + "events-target");
        if (wrapperSel) {
          var w = resolveElementFromSelector(document, wrapperSel);
          if (w) opts.wrapper = w;
        }
        if (contentSel) {
          var c = resolveElementFromSelector(document, contentSel);
          if (c) opts.content = c;
        }
        if (eventsSel) {
          var et = resolveElementFromSelector(document, eventsSel);
          if (et) opts.eventsTarget = et;
        }
        return opts;
      }
      function getContentForWrapper(wrapperEl) {
        var selector = getAttrFrom(wrapperEl, "rt-smooth-scroll-content");
        if (selector) {
          var found = null;
          try {
            found = wrapperEl.querySelector(selector);
          } catch (e) {
            found = null;
          }
          if (found) return found;
        }
        return wrapperEl.firstElementChild || wrapperEl;
      }
      function createInstance(id, wrapper, content, options, isRoot) {
        var opts = options || {};
        if (!isRoot) {
          if (wrapper) opts.wrapper = wrapper;
          if (content) opts.content = content;
        }
        var inst = new window.Lenis(opts);
        state.instances[id] = inst;
        state.order.push(id);
        if (id === "root") window.lenis = inst;
        if (debug) {
          try {
            console.log("[rt-smooth-scroll] instance:", id, {
              wrapper: isRoot ? opts.wrapper || "default" : wrapper,
              content: isRoot ? opts.content || "default" : content,
              options: sanitizeOptionsForLog(opts)
            });
          } catch (e) {
          }
        }
        return inst;
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
          ids: function() {
            return state.order.slice();
          },
          get: function(id) {
            return state.instances[id] || null;
          },
          start: function(id) {
            forEachTarget(id, function(_, inst) {
              inst.start();
            });
          },
          stop: function(id) {
            forEachTarget(id, function(_, inst) {
              inst.stop();
            });
          },
          toggle: function(id, force) {
            forEachTarget(id, function(_, inst) {
              if (typeof force === "boolean") {
                if (force) inst.stop();
                else inst.start();
                return;
              }
              if (inst.isStopped) inst.start();
              else inst.stop();
            });
          },
          resize: function(id) {
            forEachTarget(id, function(k) {
              scheduleResize(k);
            });
          },
          destroy: function(id) {
            if (state.destroyed) return;
            function destroyOne(k) {
              clearTimeout(state.resizeTimers[k]);
              var inst = state.instances[k];
              if (inst) {
                try {
                  inst.destroy();
                } catch (e) {
                }
                delete state.instances[k];
              }
              var idx = state.order.indexOf(k);
              if (idx >= 0) state.order.splice(idx, 1);
              if (k === "root") {
                try {
                  delete window.lenis;
                } catch (e) {
                  window.lenis = void 0;
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
          }
        };
      }
      function installLegacyAliases(api) {
        window.disableScroll = function() {
          api.stop();
          if (document.body) document.body.classList.add("no-scroll");
        };
        window.enableScroll = function() {
          api.start();
          if (document.body) document.body.classList.remove("no-scroll");
        };
      }
      loadScriptOnce(lenisSrc).then(function() {
        if (state.destroyed) return;
        var els = document.querySelectorAll("[rt-smooth-scroll-instance]");
        var totalCount = (enabledRoot ? 1 : 0) + (els ? els.length : 0);
        var allowAutoRaf = totalCount === 1 && enabledRoot && (!els || els.length === 0);
        if (enabledRoot && !state.instances.root) {
          var optsRoot = readOptions(function() {
            return null;
          });
          optsRoot = applySelectorsToOptions(
            document.body || document.documentElement,
            optsRoot
          );
          if (allowAutoRaf) {
            var rawAutoRaf = getAttr("rt-smooth-scroll-auto-raf");
            var autoRaf = isAttrPresent(rawAutoRaf) ? parseBool(rawAutoRaf, true) : true;
            optsRoot.autoRaf = autoRaf;
          } else {
            optsRoot.autoRaf = false;
          }
          createInstance("root", null, null, optsRoot, true);
        }
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
          var opts = readOptions(function(name) {
            return getAttrFrom(el, name);
          });
          opts = applySelectorsToOptions(el, opts);
          opts.autoRaf = false;
          createInstance(id, el, content, opts, false);
        }
        if (!allowAutoRaf) {
          startRaf();
        }
        var api = makeApi();
        window[RT_NS] = api;
        installLegacyAliases(api);
        window.addEventListener("resize", function() {
          api.resize();
        });
      }).catch(function() {
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
    window[RT_NS] = window[RT_NS] || {
      __initialized: true,
      ids: function() {
        return [];
      },
      get: function() {
        return null;
      }
    };
  })();
})();
//# sourceMappingURL=index.js.map
