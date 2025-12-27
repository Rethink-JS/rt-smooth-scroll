# rt-smooth-scroll

![Platform: Web](https://img.shields.io/badge/platform-web-000000)
![JavaScript](https://img.shields.io/badge/language-JavaScript-F7DF1E?logo=javascript)
[![npm version](https://img.shields.io/npm/v/%40rethink-js%2Frt-smooth-scroll.svg)](https://www.npmjs.com/package/@rethink-js/rt-smooth-scroll)
[![jsDelivr hits](https://data.jsdelivr.com/v1/package/npm/@rethink-js/rt-smooth-scroll/badge)](https://www.jsdelivr.com/package/npm/@rethink-js/rt-smooth-scroll)
[![bundle size](https://img.shields.io/bundlephobia/min/%40rethink-js%2Frt-smooth-scroll)](https://bundlephobia.com/package/@rethink-js/rt-smooth-scroll)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFD632.svg)](https://opensource.org/licenses/MIT)

`rt-smooth-scroll` is a lightweight JavaScript library that seamlessly integrates the **Lenis smooth scroll engine** into your sites with:

- **Automatic Lenis loading** (no extra installs/styles needed)
- **Zero-config defaults** that work out of the box
- Support for **multiple smooth scroll instances**
- A clean global API under `window.rtSmoothScroll`
- Automatic resize + mutation observation for reliable reflow handling
- Per-instance configuration via HTML attributes
- Console logs showing each instance’s final resolved config

**Lenis GitHub:** https://github.com/studio-freight/lenis :contentReference[oaicite:0]{index=0}

---

# Table of Contents

- [1. Installation](#1-installation)
  - [1.1 CDN (jsDelivr)](#11-cdn-jsdelivr)
  - [1.2 npm](#12-npm)
- [2. Quick Start](#2-quick-start)
- [3. Activation Rules](#3-activation-rules)
- [4. Configuration (HTML Attributes)](#4-configuration-html-attributes)
- [5. Multiple Instances](#5-multiple-instances)
- [6. Global API](#6-global-api)
- [7. Console Logging](#7-console-logging)
- [8. Troubleshooting](#8-troubleshooting)
- [9. License](#9-license)

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

- Enable itself automatically
- Apply recommended default settings to `<body>`
- Load Lenis from CDN
- Create a root smooth scroll instance
- Expose the global API

Example:

```html
<script src="https://cdn.jsdelivr.net/npm/@rethink-js/rt-smooth-scroll@latest/dist/index.min.js"></script>
```

---

## 3. Activation Rules

The library is activated when:

- The attribute `rt-smooth-scroll` exists on `<html>` or `<body>` **OR**
- You place one or more elements with `rt-smooth-scroll-instance`

If neither is present and no instance elements are found, it **auto-enables** itself on `<body>` with defaults.

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

**Core attributes:**

| Attribute                              | Description                 |
| -------------------------------------- | --------------------------- |
| `rt-smooth-scroll-duration`            | Lenis `duration` value      |
| `rt-smooth-scroll-lerp`                | Lenis `lerp` value          |
| `rt-smooth-scroll-orientation`         | Scroll orientation          |
| `rt-smooth-scroll-gesture-orientation` | Gesture orientation         |
| `rt-smooth-scroll-normalize-wheel`     | Normalize wheel input       |
| `rt-smooth-scroll-wheel-multiplier`    | Multiplies wheel delta      |
| `rt-smooth-scroll-sync-touch`          | Sync touch behavior         |
| `rt-smooth-scroll-touch-multiplier`    | Multiplies touch delta      |
| `rt-smooth-scroll-infinite`            | Enable infinite scroll mode |
| `rt-smooth-scroll-easing`              | Named easing function       |

**Easing options include:**

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

| Attribute                   | Description                  |
| --------------------------- | ---------------------------- |
| `rt-smooth-scroll-instance` | Marks scroll container       |
| `rt-smooth-scroll-id`       | Optional instance identifier |
| `rt-smooth-scroll-content`  | Selector inside container    |

### Advanced JSON

You may pass additional Lenis options via:

```html
<body
  rt-smooth-scroll
  rt-smooth-scroll-options-json='{"overscroll":true}'
></body>
```

---

## 5. Multiple Instances

`rt-smooth-scroll` supports any number of independent Lenis instances on a page. Each instance has its own wrapper + content and can be controlled individually via API.

---

## 6. Global API

After initialization, access:

```js
window.rtSmoothScroll;
```

### Common methods:

| Method         | Description                      |
| -------------- | -------------------------------- |
| `ids()`        | Array of registered instance ids |
| `get(id)`      | Returns Lenis instance           |
| `start(id?)`   | Start scroll                     |
| `stop(id?)`    | Stop scroll                      |
| `toggle(id?)`  | Toggle scroll                    |
| `resize(id?)`  | Trigger Lenis resize             |
| `destroy(id?)` | Remove instance                  |

**Default root Lenis instance** is also exposed as:

```js
window.lenis;
```

---

## 7. Console Logging

On startup, each instance logs:

- Instance ID
- Wrapper element
- Content element
- Final resolved options

This helps you confirm exactly what configuration is applied in the browser.

---

## 8. Troubleshooting

### Scroll feels laggy

- Lower `lerp` (e.g., `0.18–0.3`) for snappier response.
- Avoid combining duration and lerp unintentionally.

### Instance not initialized

Ensure you’ve enabled either:

- the root attribute (`rt-smooth-scroll`), or
- one or more instance elements.

### Lenis fails to load

If using a custom `rt-smooth-scroll-lenis-src`, confirm the URL points to a valid Lenis build.

---

## 9. License

MIT License

Package: `@rethink-js/rt-smooth-scroll`
<br>
GitHub: [https://github.com/Rethink-JS/rt-smooth-scroll](https://github.com/Rethink-JS/rt-smooth-scroll)

---

by **Rethink JS**
<br>
[https://github.com/Rethink-JS](https://github.com/Rethink-JS)
