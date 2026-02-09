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
    var s = String(v).trim();
    if (!s.length) return def;
    var n = Number(s);
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

  function resolveTargetFromStr(selectorStr) {
    if (!selectorStr) return null;
    var s = String(selectorStr).trim();
    if (!s) return null;
    if (s === "window") return window;

    var match = s.match(/^(.*)\(\s*(\d+)\s*\)$/);
    if (match) {
      var baseSelector = match[1].trim();
      var index = parseInt(match[2], 10);
      if (!baseSelector || isNaN(index) || index < 1) return null;
      try {
        var all = document.querySelectorAll(baseSelector);
        return all[index - 1] || null;
      } catch (e) {
        return null;
      }
    }

    try {
      return document.querySelector(s);
    } catch (e) {
      return null;
    }
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
    return v !== null && v !== undefined;
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
    var lerp = parseNum(getRaw("lerp"), undefined);
    var hasDuration = hasRaw("duration");
    var duration = parseNum(getRaw("duration"), undefined);
    var hasEasing = hasRaw("easing");
    var easingName = parseStr(getRaw("easing"), "");
    var easingFn = easingByName(easingName);

    if (hasLerp && lerp !== undefined) {
      opts.lerp = lerp;
    } else {
      if (hasDuration && duration !== undefined) opts.duration = duration;
      if (hasEasing && easingFn) opts.easing = easingFn;
    }

    if (hasRaw("orientation"))
      opts.orientation = parseStr(getRaw("orientation"), "");
    if (hasRaw("gesture-orientation"))
      opts.gestureOrientation = parseStr(getRaw("gesture-orientation"), "");

    var smoothWheelRaw = getRaw("smooth-wheel");
    var normalizeWheelRaw = getRaw("normalize-wheel");
    if (isAttrPresent(smoothWheelRaw))
      opts.smoothWheel = parseBool(smoothWheelRaw, true);
    else if (isAttrPresent(normalizeWheelRaw))
      opts.smoothWheel = parseBool(normalizeWheelRaw, true);

    if (hasRaw("wheel-multiplier"))
      opts.wheelMultiplier = parseNum(getRaw("wheel-multiplier"), undefined);
    if (hasRaw("touch-multiplier"))
      opts.touchMultiplier = parseNum(getRaw("touch-multiplier"), undefined);
    if (hasRaw("sync-touch"))
      opts.syncTouch = parseBool(getRaw("sync-touch"), false);
    if (hasRaw("sync-touch-lerp"))
      opts.syncTouchLerp = parseNum(getRaw("sync-touch-lerp"), undefined);
    if (hasRaw("touch-inertia-exponent"))
      opts.touchInertiaExponent = parseNum(
        getRaw("touch-inertia-exponent"),
        undefined,
      );
    if (hasRaw("infinite"))
      opts.infinite = parseBool(getRaw("infinite"), false);
    if (hasRaw("auto-resize"))
      opts.autoResize = parseBool(getRaw("auto-resize"), true);
    if (hasRaw("overscroll"))
      opts.overscroll = parseBool(getRaw("overscroll"), true);

    if (hasRaw("anchors")) {
      var s = String(getRaw("anchors") || "").trim();
      if (s === "" || s.toLowerCase() === "true") opts.anchors = true;
      else if (s.toLowerCase() === "false") opts.anchors = false;
      else {
        try {
          opts.anchors = JSON.parse(s);
        } catch (e) {
          opts.anchors = true;
        }
      }
    }

    if (hasRaw("auto-toggle"))
      opts.autoToggle = parseBool(getRaw("auto-toggle"), false);
    if (hasRaw("allow-nested-scroll"))
      opts.allowNestedScroll = parseBool(getRaw("allow-nested-scroll"), false);

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

  function parseOnCompleteAction(raw) {
    if (raw === null || raw === undefined) return null;
    var s = String(raw).trim();
    if (!s.length) return null;

    var lower = s.toLowerCase();

    function tryQuery(sel) {
      if (!sel) return null;
      try {
        return document.querySelector(sel);
      } catch (e) {
        return null;
      }
    }

    function safeClick(el) {
      if (!el) return false;
      try {
        el.click();
        return true;
      } catch (e) {
        return false;
      }
    }

    function safeFocus(el) {
      if (!el) return false;
      try {
        if (typeof el.focus === "function") el.focus();
        return true;
      } catch (e) {
        return false;
      }
    }

    if (lower.indexOf("{") === 0 || lower.indexOf("[") === 0) {
      try {
        var parsed = JSON.parse(s);
        return function (inst, ctx) {
          try {
            if (!parsed) return;
            var arr = Array.isArray(parsed) ? parsed : [parsed];
            for (var i = 0; i < arr.length; i++) {
              var a = arr[i];
              if (!a || typeof a !== "object") continue;

              var type =
                typeof a.type === "string" ? a.type.trim().toLowerCase() : "";
              var selector =
                typeof a.selector === "string" ? a.selector.trim() : "";
              var name = typeof a.name === "string" ? a.name.trim() : "";
              var detail = a.detail !== undefined ? a.detail : undefined;

              if (type === "click") {
                safeClick(tryQuery(selector));
              } else if (type === "focus") {
                safeFocus(tryQuery(selector));
              } else if (type === "dispatch") {
                var evName = name || selector;
                if (evName) {
                  try {
                    var ev = new CustomEvent(evName, {
                      detail: {
                        trigger: ctx && ctx.trigger ? ctx.trigger : null,
                        target: ctx && ctx.target ? ctx.target : null,
                        value: ctx && ctx.value ? ctx.value : null,
                        id: ctx && ctx.id ? ctx.id : null,
                        detail: detail,
                      },
                    });
                    window.dispatchEvent(ev);
                  } catch (e) {}
                }
              } else if (type === "call") {
                var fnName = name || selector;
                if (
                  fnName &&
                  window[fnName] &&
                  typeof window[fnName] === "function"
                ) {
                  try {
                    window[fnName]({
                      lenis: inst || null,
                      trigger: ctx && ctx.trigger ? ctx.trigger : null,
                      target: ctx && ctx.target ? ctx.target : null,
                      value: ctx && ctx.value ? ctx.value : null,
                      id: ctx && ctx.id ? ctx.id : null,
                      detail: detail,
                    });
                  } catch (e) {}
                }
              }
            }
          } catch (e) {}
        };
      } catch (e) {}
    }

    var m = s.match(/^\s*([a-zA-Z]+)\s*:\s*(.+)\s*$/);
    if (m) {
      var type2 = String(m[1] || "")
        .trim()
        .toLowerCase();
      var rest = String(m[2] || "").trim();
      if (!rest.length) return null;

      if (type2 === "click") {
        return function () {
          safeClick(tryQuery(rest));
        };
      }
      if (type2 === "focus") {
        return function () {
          safeFocus(tryQuery(rest));
        };
      }
      if (type2 === "dispatch" || type2 === "event") {
        return function (inst, ctx) {
          try {
            var ev2 = new CustomEvent(rest, {
              detail: {
                trigger: ctx && ctx.trigger ? ctx.trigger : null,
                target: ctx && ctx.target ? ctx.target : null,
                value: ctx && ctx.value ? ctx.value : null,
                id: ctx && ctx.id ? ctx.id : null,
              },
            });
            window.dispatchEvent(ev2);
          } catch (e) {}
        };
      }
      if (type2 === "call" || type2 === "fn" || type2 === "function") {
        return function (inst, ctx) {
          try {
            if (window[rest] && typeof window[rest] === "function") {
              window[rest]({
                lenis: inst || null,
                trigger: ctx && ctx.trigger ? ctx.trigger : null,
                target: ctx && ctx.target ? ctx.target : null,
                value: ctx && ctx.value ? ctx.value : null,
                id: ctx && ctx.id ? ctx.id : null,
              });
            }
          } catch (e) {}
        };
      }
    }

    var el = tryQuery(s);
    if (el) {
      return function () {
        safeClick(el);
      };
    }

    return null;
  }

  function convertAnchorLinks() {
    var raw = getAttr("rt-smooth-scroll-anchor-links");
    if (!parseBool(raw, false)) return 0;

    var defaultOnComplete = getAttr(
      "rt-smooth-scroll-anchor-links-on-complete",
    );

    var links = document.querySelectorAll('a[href*="#"]');
    var currentPath = window.location.pathname
      .replace(/\/+$/, "")
      .toLowerCase();
    var origin = window.location.origin;
    var count = 0;

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.hasAttribute("rt-smooth-scroll-to")) continue;

      var href = link.getAttribute("href");
      if (!href) continue;

      var hashIndex = href.indexOf("#");
      if (hashIndex === -1) continue;

      var pathPart = href.substring(0, hashIndex);
      var hashPart = href.substring(hashIndex);

      if (hashPart.length <= 1) continue;

      var isLocal = false;
      if (pathPart === "" || pathPart === "./") {
        isLocal = true;
      } else {
        var normPath = pathPart.replace(/\/+$/, "").toLowerCase();
        if (pathPart.indexOf("http") === 0) {
          try {
            var u = new URL(href, origin);
            if (
              u.origin === origin &&
              u.pathname.replace(/\/+$/, "").toLowerCase() === currentPath
            ) {
              isLocal = true;
            }
          } catch (e) {}
        } else if (normPath === currentPath) {
          isLocal = true;
        }
      }

      if (isLocal) {
        link.setAttribute("rt-smooth-scroll-to", hashPart);

        if (
          !link.hasAttribute("rt-smooth-scroll-on-complete") &&
          defaultOnComplete !== null &&
          defaultOnComplete !== undefined
        ) {
          link.setAttribute(
            "rt-smooth-scroll-on-complete",
            String(defaultOnComplete),
          );
        }

        link.removeAttribute("href");
        link.style.cursor = "pointer";
        link.setAttribute("tabindex", "0");
        link.setAttribute("role", "button");
        count++;
      }
    }
    return count;
  }

  function init() {
    ensureAutoEnableIfNeeded();
    var convertedCount = convertAnchorLinks();

    var enabledRoot = hasAttrAnywhere("rt-smooth-scroll");
    var instanceEls = document.querySelectorAll("[rt-smooth-scroll-instance]");
    var hasInstances = instanceEls && instanceEls.length > 0;
    var shouldRun = enabledRoot || hasInstances;
    if (!shouldRun) return;

    var lenisSrc = parseStr(
      getAttr("rt-smooth-scroll-lenis-src"),
      "https://cdn.jsdelivr.net/npm/lenis@1.3.16/dist/lenis.min.js",
    );
    var resizeDebounceMs = parseNum(
      getAttr("rt-smooth-scroll-resize-debounce-ms"),
      0,
    );
    var debug = parseBool(getAttr("rt-smooth-scroll-debug"), true);

    function log(msg, extra) {
      if (debug) {
        if (extra !== undefined)
          console.log("[rt-smooth-scroll] " + msg, extra);
        else console.log("[rt-smooth-scroll] " + msg);
      }
    }

    if (convertedCount > 0) log("Anchors converted:", convertedCount);

    var state = {
      destroyed: false,
      rafId: 0,
      instances: {},
      observers: {},
      order: [],
      resizeTimers: {},
      clickListener: null,
      keyListener: null,
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

    function startResizeObserver(id, element) {
      if (!element || typeof ResizeObserver === "undefined") return;
      try {
        var ro = new ResizeObserver(function () {
          scheduleResize(id);
        });
        ro.observe(element);
        state.observers[id] = ro;
        log("Auto-resize observer attached:", id);
      } catch (e) {
        log("Failed to attach resize observer:", e);
      }
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

      // START OBSERVER FOR AUTO-RESIZE ON DOM CHANGES
      var observeTarget = null;
      if (isRoot) {
        observeTarget = document.body;
      } else {
        observeTarget = opts.content || opts.wrapper || wrapper;
      }
      startResizeObserver(id, observeTarget);

      log("Instance created:", {
        id: id,
        isRoot: isRoot,
        options: sanitizeOptionsForLog(opts),
      });

      return inst;
    }

    function setupScrollToListeners() {
      if (state.clickListener) return;

      var handleScrollAction = function (targetEl, e) {
        var targetVal = targetEl.getAttribute("rt-smooth-scroll-to");
        if (!targetVal) return;

        log("Scroll triggered to:", targetVal);

        if (e) e.preventDefault();

        var target = null;
        var numeric = parseFloat(targetVal);

        if (targetVal === "top") {
          target = 0;
        } else if (!isNaN(numeric) && isFinite(numeric)) {
          target = numeric;
        } else {
          target = resolveTargetFromStr(targetVal);
        }

        if (target === null && targetVal !== "top" && isNaN(numeric)) {
          log("Target not found for:", targetVal);
          return;
        }

        var instance = null;
        var explicitId = targetEl.getAttribute("rt-smooth-scroll-target-id");
        if (explicitId && state.instances[explicitId]) {
          instance = state.instances[explicitId];
        } else {
          var parentWrapper = targetEl.closest("[rt-smooth-scroll-instance]");
          if (parentWrapper) {
            var parentId = parentWrapper.getAttribute("rt-smooth-scroll-id");
            if (parentId && state.instances[parentId]) {
              instance = state.instances[parentId];
            }
          }
        }
        if (!instance && state.instances["root"]) {
          instance = state.instances["root"];
        }

        if (!instance) {
          log("No instance found to handle scroll.");
          return;
        }

        instance.resize();

        var opts = {};
        var offsetRaw = targetEl.getAttribute("rt-smooth-scroll-offset");
        if (offsetRaw) {
          var offsetNum = parseFloat(offsetRaw);
          if (!isNaN(offsetNum) && isFinite(offsetNum)) {
            opts.offset = offsetNum;
          } else {
            var offsetEl = resolveTargetFromStr(offsetRaw);
            if (offsetEl) opts.offset = -1 * offsetEl.offsetHeight;
          }
        }
        var dur = parseNum(
          targetEl.getAttribute("rt-smooth-scroll-duration"),
          undefined,
        );
        if (dur !== undefined) opts.duration = dur;
        var immediate = parseBool(
          targetEl.getAttribute("rt-smooth-scroll-immediate"),
          null,
        );
        if (immediate !== null) opts.immediate = immediate;
        var lock = parseBool(
          targetEl.getAttribute("rt-smooth-scroll-lock"),
          null,
        );
        if (lock !== null) opts.lock = lock;
        var force = parseBool(
          targetEl.getAttribute("rt-smooth-scroll-force"),
          null,
        );
        if (force !== null) opts.force = force;

        var onCompleteRawLocal = targetEl.getAttribute(
          "rt-smooth-scroll-on-complete",
        );
        var onCompleteRawGlobal = getAttr("rt-smooth-scroll-on-complete");
        var onCompleteFn = parseOnCompleteAction(
          isAttrPresent(onCompleteRawLocal)
            ? onCompleteRawLocal
            : onCompleteRawGlobal,
        );

        var ctx = {
          trigger: targetEl,
          target: target,
          value: targetVal,
          id: explicitId || null,
        };

        var userOnComplete = null;
        if (onCompleteFn) {
          userOnComplete = function (inst) {
            try {
              onCompleteFn(inst, ctx);
            } catch (e) {}
          };
        }

        var didCorrect = false;
        var originalComplete = opts.onComplete;

        opts.onComplete = function (inst) {
          if (target instanceof Element) {
            if (!didCorrect) {
              didCorrect = true;
              try {
                instance.resize();
              } catch (e) {}
              var retryOpts = {};
              for (var k in opts) retryOpts[k] = opts[k];
              delete retryOpts.onComplete;
              retryOpts.onComplete = function (inst2) {
                if (originalComplete) {
                  try {
                    originalComplete(inst2);
                  } catch (e) {}
                }
                if (userOnComplete) {
                  try {
                    userOnComplete(inst2);
                  } catch (e) {}
                }
              };
              instance.scrollTo(target, retryOpts);
              return;
            }
          }

          if (originalComplete) {
            try {
              originalComplete(inst);
            } catch (e) {}
          }
          if (userOnComplete) {
            try {
              userOnComplete(inst);
            } catch (e) {}
          }
        };

        instance.scrollTo(target, opts);
      };

      state.clickListener = function (e) {
        var trigger = e.target.closest("[rt-smooth-scroll-to]");
        if (trigger) handleScrollAction(trigger, e);
      };

      state.keyListener = function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var trigger = e.target.closest("[rt-smooth-scroll-to]");
        if (trigger && !trigger.hasAttribute("href")) {
          handleScrollAction(trigger, e);
        }
      };

      document.addEventListener("click", state.clickListener);
      document.addEventListener("keydown", state.keyListener);
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
        refreshAnchors: function () {
          var c = convertAnchorLinks();
          if (c > 0) log("Anchors refreshed, count:", c);
        },
        destroy: function (id) {
          if (state.destroyed) return;
          function destroyOne(k) {
            clearTimeout(state.resizeTimers[k]);
            // Stop and remove resize observer
            if (state.observers[k]) {
              try {
                state.observers[k].disconnect();
              } catch (e) {}
              delete state.observers[k];
            }
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
            log("Instance destroyed:", k);
          }
          if (typeof id === "string" && id.length) {
            destroyOne(id);
            return;
          }
          if (state.clickListener) {
            document.removeEventListener("click", state.clickListener);
            state.clickListener = null;
          }
          if (state.keyListener) {
            document.removeEventListener("keydown", state.keyListener);
            state.keyListener = null;
          }
          while (state.order.length) destroyOne(state.order[0]);
          state.destroyed = true;
          if (state.rafId) cancelAnimationFrame(state.rafId);
          log("All instances destroyed.");
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
        log("Lenis script loaded.");
        if (state.destroyed) return;
        var els = document.querySelectorAll("[rt-smooth-scroll-instance]");
        var totalCount = (enabledRoot ? 1 : 0) + (els ? els.length : 0);
        var allowAutoRaf =
          totalCount === 1 && enabledRoot && (!els || els.length === 0);

        if (enabledRoot && !state.instances.root) {
          var optsRoot = readOptions(function () {
            return null;
          });
          optsRoot = applySelectorsToOptions(
            document.body || document.documentElement,
            optsRoot,
          );
          if (allowAutoRaf) {
            var rawAutoRaf = getAttr("rt-smooth-scroll-auto-raf");
            var autoRaf = isAttrPresent(rawAutoRaf)
              ? parseBool(rawAutoRaf, true)
              : true;
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
            el.setAttribute("rt-smooth-scroll-id", id);
          }
          if (state.instances[id]) continue;
          var content = getContentForWrapper(el);
          var opts = readOptions(function (name) {
            return getAttrFrom(el, name);
          });
          opts = applySelectorsToOptions(el, opts);
          opts.autoRaf = false;
          createInstance(id, el, content, opts, false);
        }

        if (!allowAutoRaf) startRaf();

        var api = makeApi();
        window[RT_NS] = api;
        installLegacyAliases(api);

        setupScrollToListeners();

        window.addEventListener("resize", function () {
          api.resize();
        });
      })
      .catch(function (e) {
        log("Error loading Lenis script:", e);
      });
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
