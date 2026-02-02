# rt-smooth-scroll

![Platform: Web](https://img.shields.io/badge/platform-web-000000)
![JavaScript](https://img.shields.io/badge/language-JavaScript-F7DF1E?logo=javascript)
[![npm version](https://img.shields.io/npm/v/%40rethink-js%2Frt-smooth-scroll.svg)](https://www.npmjs.com/package/@rethink-js/rt-smooth-scroll)
[![jsDelivr hits](https://data.jsdelivr.com/v1/package/npm/@rethink-js/rt-smooth-scroll/badge)](https://www.jsdelivr.com/package/npm/@rethink-js/rt-smooth-scroll)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFD632.svg)](https://opensource.org/licenses/MIT)

`rt-smooth-scroll` is a lightweight JavaScript library that seamlessly integrates the **Lenis smooth scroll engine** into your sites with:

- **Automatic Lenis loading** (no extra installs needed)
- **Zero-config defaults** (Lenis defaults, unless you override via attributes)
- Support for **multiple smooth scroll instances**
- A clean global API under `window.rtSmoothScroll`
- **Smart Scroll-To actions** with indexed selectors and dynamic offsets
- **Automatic Anchor Link Conversion** (hijack native links for smooth scrolling)
- **Scroll-To Completion Hooks** (run actions/functions after a scroll-to completes)
- Per-instance configuration via HTML attributes
- Console logs showing each instance’s final resolved config

**Lenis (GitHub):** https://github.com/darkroomengineering/lenis

---

# Table of Contents

- [1. Installation](#1-installation)
  - [1.1 CDN (jsDelivr)](#11-cdn-jsdelivr)
  - [1.2 npm](#12-npm)
- [2. Quick Start](#2-quick-start)
- [3. Activation Rules](#3-activation-rules)
- [4. Configuration (HTML Attributes)](#4-configuration-html-attributes)
- [5. Scroll-To Actions](#5-scroll-to-actions)
- [6. Anchor Link Conversion](#6-anchor-link-conversion)
- [7. Multiple Instances](#7-multiple-instances)
- [8. Global API](#8-global-api)
- [9. Console Logging](#9-console-logging)
- [10. Troubleshooting](#10-troubleshooting)
- [11. License](#11-license)

---

## 1. Installation

### 1.1 CDN (jsDelivr)

```html
<script src="https://cdn.jsdelivr.net/npm/@rethink-js/rt-smooth-scroll@latest/dist/index.min.js"></script>
```

### 1.2 npm

```bash
npm install @rethink-js/rt-smooth-scroll
```

Then bundle or load `dist/index.min.js` as appropriate for your build setup.

---

## 2. Quick Start

Add the script to your page. With no configuration provided, `rt-smooth-scroll` will:

- Activate itself automatically (if you didn’t explicitly opt out)
- Load Lenis from CDN
- Create a root smooth scroll instance
- Expose the global API

Example:

```html
<script src="https://cdn.jsdelivr.net/npm/@rethink-js/rt-smooth-scroll@latest/dist/index.min.js"></script>
```

> Note: If you do not set any `rt-smooth-scroll-*` config attributes, the root instance uses **Lenis defaults**.

---

## 3. Activation Rules

The library is activated when:

- The attribute `rt-smooth-scroll` exists on `<html>` or `<body>` **OR**
- You place one or more elements with `rt-smooth-scroll-instance`

If neither is present and no instance elements are found, it **auto-enables** itself on `<body>` by adding `rt-smooth-scroll` (so you get a working root instance by default).

---

## 4. Configuration (HTML Attributes)

### Root Mode

Add to `<html>` or `<body>` to enable:

```html
<body rt-smooth-scroll></body>
```

### Global Options

Place on `<html>` or `<body>` to configure defaults:

```html
<body
  rt-smooth-scroll
  rt-smooth-scroll-lerp="0.2"
  rt-smooth-scroll-wheel-multiplier="1"
  rt-smooth-scroll-easing="easeOutCubic"
></body>
```

Important Lenis behavior:

- `duration` and `easing` are **useless if `lerp` is defined** (this is how Lenis works).

**Core attributes:**

| Attribute                                 | Description                                                  |
| ----------------------------------------- | ------------------------------------------------------------ |
| `rt-smooth-scroll-duration`               | Lenis `duration` (only applies when `lerp` is not used)      |
| `rt-smooth-scroll-lerp`                   | Lenis `lerp` (0 → 1)                                         |
| `rt-smooth-scroll-orientation`            | Lenis `orientation`                                          |
| `rt-smooth-scroll-gesture-orientation`    | Lenis `gestureOrientation`                                   |
| `rt-smooth-scroll-normalize-wheel`        | Alias of Lenis `smoothWheel` (legacy naming supported)       |
| `rt-smooth-scroll-smooth-wheel`           | Lenis `smoothWheel`                                          |
| `rt-smooth-scroll-wheel-multiplier`       | Lenis `wheelMultiplier`                                      |
| `rt-smooth-scroll-touch-multiplier`       | Lenis `touchMultiplier`                                      |
| `rt-smooth-scroll-sync-touch`             | Lenis `syncTouch`                                            |
| `rt-smooth-scroll-sync-touch-lerp`        | Lenis `syncTouchLerp`                                        |
| `rt-smooth-scroll-touch-inertia-exponent` | Lenis `touchInertiaExponent`                                 |
| `rt-smooth-scroll-infinite`               | Lenis `infinite`                                             |
| `rt-smooth-scroll-auto-resize`            | Lenis `autoResize`                                           |
| `rt-smooth-scroll-overscroll`             | Lenis `overscroll`                                           |
| `rt-smooth-scroll-anchors`                | Lenis `anchors` (boolean or JSON)                            |
| `rt-smooth-scroll-auto-toggle`            | Lenis `autoToggle`                                           |
| `rt-smooth-scroll-allow-nested-scroll`    | Lenis `allowNestedScroll`                                    |
| `rt-smooth-scroll-easing`                 | Named easing function (only applies when `lerp` is not used) |
| `rt-smooth-scroll-options-json`           | Merge additional Lenis options via JSON                      |

**Easing options included:**

- `linear`
- `easeInQuad`
- `easeOutQuad`
- `easeInOutQuad`
- `easeInCubic`
- `easeOutCubic`
- `easeInOutCubic`
- `easeInOutSine`
- `easeOutExpo`

### Per-Instance Configuration

Add attributes to any scroll container:

```html
<div
  rt-smooth-scroll-instance
  rt-smooth-scroll-id="panel"
  rt-smooth-scroll-content=".scroll-content"
  rt-smooth-scroll-lerp="0.18"
></div>
```

| Attribute                   | Description                                                    |
| --------------------------- | -------------------------------------------------------------- |
| `rt-smooth-scroll-instance` | Marks scroll container                                         |
| `rt-smooth-scroll-id`       | Optional instance identifier                                   |
| `rt-smooth-scroll-content`  | Selector inside container (defaults to first child if omitted) |

### Advanced Selectors (wrapper/content/eventsTarget)

You can map Lenis DOM targets using selectors:

```html
<body
  rt-smooth-scroll
  rt-smooth-scroll-wrapper="#page-wrapper"
  rt-smooth-scroll-content="#page-content"
  rt-smooth-scroll-events-target="#page-wrapper"
></body>
```

Or per instance:

```html
<div
  rt-smooth-scroll-instance
  rt-smooth-scroll-id="panel"
  rt-smooth-scroll-wrapper="#panel-wrapper"
  rt-smooth-scroll-content=".panel-content"
  rt-smooth-scroll-events-target="#panel-wrapper"
></div>
```

---

## 5. Scroll-To Actions

You can trigger a smooth scroll to any element, position, or specific instance using the `rt-smooth-scroll-to` attribute on any clickable element.

### Basic Usage

```html
<button rt-smooth-scroll-to="#footer">Go to Footer</button>

<button rt-smooth-scroll-to="top">Back to Top</button>

<button rt-smooth-scroll-to="500">Go to 500px</button>
```

### Indexed Selectors

You can target elements by class order (1-based index) using `.class(N)` syntax.

```html
<button rt-smooth-scroll-to=".section(2)">Go to Section 2</button>
```

### Customization Attributes

You can customize the scroll behavior for specific triggers.

| Attribute                    | Description                                                        |
| ---------------------------- | ------------------------------------------------------------------ |
| `rt-smooth-scroll-offset`    | Offset in pixels. **Supports selectors!** (See below)              |
| `rt-smooth-scroll-duration`  | Override scroll duration for this action                           |
| `rt-smooth-scroll-immediate` | Jump instantly (true/false)                                        |
| `rt-smooth-scroll-lock`      | Lock scroll during animation                                       |
| `rt-smooth-scroll-force`     | Force scroll even if stopped                                       |
| `rt-smooth-scroll-target-id` | **Explicitly** target a specific scroll instance ID (e.g. "panel") |

### Dynamic Element Offsets

Instead of hardcoding pixels, you can pass a selector to `rt-smooth-scroll-offset`. The library will calculate that element's `offsetHeight` and apply it as a **negative offset** (perfect for sticky headers).

```html
<button rt-smooth-scroll-to="#about" rt-smooth-scroll-offset="#nav">
  About
</button>
```

### Scroll-To Completion Hooks

When a scroll-to finishes (including the built-in correction pass for layout shifts), you can run an action/function.

**Supported hook attributes:**

- Per-trigger: `rt-smooth-scroll-on-complete`
- Global default: `rt-smooth-scroll-on-complete` on `<html>` or `<body>`

#### 5.1 Per-trigger completion action

Click an element after the scroll completes:

```html
<a rt-smooth-scroll-to="#contact" rt-smooth-scroll-on-complete="#nav-show">
  Contact
</a>
```

The shorthand above treats the value as a selector and will `click()` it.

You can also be explicit:

```html
<a
  rt-smooth-scroll-to="#contact"
  rt-smooth-scroll-on-complete="click:#nav-show"
>
  Contact
</a>
```

#### 5.2 Global default completion action

Apply to all scroll-to triggers unless they override it:

```html
<body rt-smooth-scroll rt-smooth-scroll-on-complete="click:#nav-show"></body>
```

#### 5.3 Supported completion action formats

**1) Selector-only (defaults to click)**

```html
<button rt-smooth-scroll-to="#x" rt-smooth-scroll-on-complete="#nav-show">
  Go
</button>
```

**2) Typed strings**

- `click:#selector`
- `focus:#selector`
- `dispatch:event-name` (fires `CustomEvent` on `window`)
- `call:functionName` (calls `window[functionName]`)

Examples:

```html
<button rt-smooth-scroll-to="#x" rt-smooth-scroll-on-complete="focus:#search">
  Go
</button>

<button
  rt-smooth-scroll-to="#x"
  rt-smooth-scroll-on-complete="dispatch:rt:smooth-scroll:complete"
>
  Go
</button>

<button
  rt-smooth-scroll-to="#x"
  rt-smooth-scroll-on-complete="call:afterScroll"
>
  Go
</button>
```

When using `call:functionName`, your function receives a single object:

```js
window.afterScroll = function (ctx) {
  console.log("afterScroll", ctx);
};
```

`ctx` includes:

- `lenis` (the Lenis instance used)
- `trigger` (the element that initiated the scroll)
- `target` (resolved target number/element/window)
- `value` (the raw `rt-smooth-scroll-to` string)
- `id` (the explicit `rt-smooth-scroll-target-id` if provided)

**3) JSON actions (single or array)**

This is the most robust option for multi-step actions:

```html
<button
  rt-smooth-scroll-to="#x"
  rt-smooth-scroll-on-complete='[
    {"type":"click","selector":"#nav-show"},
    {"type":"dispatch","name":"rt:smooth-scroll:complete","detail":{"from":"scroll-to"}}
  ]'
>
  Go
</button>
```

Supported JSON action types:

- `{ "type": "click", "selector": "#el" }`
- `{ "type": "focus", "selector": "#el" }`
- `{ "type": "dispatch", "name": "event-name", "detail": any }`
- `{ "type": "call", "name": "functionName", "detail": any }`

For `dispatch` and `call`, `detail` is merged into the context under `detail`.

---

## 6. Anchor Link Conversion

You can automatically convert standard `<a>` tags (e.g., `<a href="#contact">`) into smooth scroll triggers without manually adding attributes to every link.

### Enable Conversion

Add this attribute to your `<body>` or `<html>` tag:

```html
<body rt-smooth-scroll rt-smooth-scroll-anchor-links="true"></body>
```

### How it works

1. **Auto-Detection:** Finds all links pointing to a hash on the current page.
2. **Hijacking:** Converts them to use the `rt-smooth-scroll-to` logic.
3. **Clean URLs:** Removes the `href` attribute so the browser URL bar does **not** update (no `#hash` in URL), keeping your history clean.
4. **Accessibility:** Automatically restores `tabindex="0"`, `role="button"`, `cursor: pointer`, and keyboard `Enter` / `Space` key support.

### Anchor link completion hook (auto-injected)

You can automatically attach a completion hook to every converted anchor link:

```html
<body
  rt-smooth-scroll
  rt-smooth-scroll-anchor-links="true"
  rt-smooth-scroll-anchor-links-on-complete="click:#nav-show"
></body>
```

Rules:

- If a link already has `rt-smooth-scroll-on-complete`, it is not overridden.
- If `rt-smooth-scroll-anchor-links-on-complete` exists, it is copied into each converted link as `rt-smooth-scroll-on-complete`.

---

## 7. Multiple Instances

`rt-smooth-scroll` supports any number of independent Lenis instances on a page. Each instance has its own wrapper + content and can be controlled individually via API.

**Context Awareness:**
If a `rt-smooth-scroll-to` button is placed **inside** a nested scroll instance, it will automatically control that parent instance, not the root window, unless you explicitly override it with `rt-smooth-scroll-target-id`.

---

## 8. Global API

After initialization, access:

```js
window.rtSmoothScroll;
```

### Common methods:

| Method             | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `ids()`            | Array of registered instance ids                                    |
| `get(id)`          | Returns Lenis instance                                              |
| `start(id?)`       | Start scroll                                                        |
| `stop(id?)`        | Stop scroll                                                         |
| `toggle(id?)`      | Toggle scroll                                                       |
| `resize(id?)`      | Trigger Lenis resize                                                |
| `refreshAnchors()` | Manually re-run anchor link conversion (useful for dynamic content) |
| `destroy(id?)`     | Remove instance                                                     |

**Default root Lenis instance** is also exposed as:

```js
window.lenis;
```

---

## 9. Console Logging

On startup, each instance logs:

- Instance ID
- Wrapper element
- Content element
- Final resolved options

This helps you confirm exactly what configuration is applied in the browser.

---

## 10. Troubleshooting

### Scroll feels laggy / too delayed

- **Increase** `rt-smooth-scroll-lerp` (e.g. `0.2 → 0.35`) for a snappier response.
- **Decrease** `rt-smooth-scroll-lerp` (e.g. `0.1 → 0.05`) for a smoother/heavier feel.
- Leave `rt-smooth-scroll-wheel-multiplier="1"` unless you have a strong reason to change perceived speed.

### Duration / easing doesn’t seem to do anything

Lenis treats `duration` and `easing` as **useless if `lerp` is defined**. If you want time-based behavior, ensure you’re not effectively running in lerp-mode.

### My `rt-smooth-scroll-on-complete` didn’t run

Common causes:

- The selector/function name is wrong or not available at runtime.
- Your completion hook depends on DOM that’s not yet mounted/visible.
- If you are using `call:fnName`, ensure `window.fnName` exists before the scroll completes.
- If you are using JSON, ensure it is valid JSON (double quotes, no trailing commas).

---

## 11. License

MIT License

Package: `@rethink-js/rt-smooth-scroll` <br>
GitHub: [https://github.com/Rethink-JS/rt-smooth-scroll](https://github.com/Rethink-JS/rt-smooth-scroll)

by **Rethink JS** <br>
[https://github.com/Rethink-JS](https://github.com/Rethink-JS)
