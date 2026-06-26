import { jsx as W } from "react/jsx-runtime";
import { useRef as C, useEffect as I } from "react";
const m = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン", G = ({
  fontSize: n = 13,
  maxDpr: u = 2,
  leadColor: g = "200, 255, 200",
  trailColor: M = "0, 200, 70",
  accentColor: w = "0, 210, 210",
  trailFade: p = 0.6,
  accentProbability: x = 0.03,
  opacity: q = 0.16,
  className: H = "matrix-rain",
  style: L,
  respectReducedMotion: v = !0,
  maxFps: A = 35
}) => {
  const $ = C(null);
  return I(() => {
    const o = $.current;
    if (!o || v && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const e = o.getContext("2d");
    if (!e) return;
    let E = [], i, l = 0, s = window.innerWidth, a = window.innerHeight;
    const f = () => {
      const r = Math.min(window.devicePixelRatio || 1, u);
      s = window.innerWidth, a = window.innerHeight, o.width = Math.floor(s * r), o.height = Math.floor(a * r), o.style.width = `${s}px`, o.style.height = `${a}px`, e.setTransform(r, 0, 0, r, 0, 0);
      const c = Math.floor(s / n);
      E = Array.from({ length: c }, () => ({
        y: Math.random() * -a,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.4 + Math.random() * 0.6,
        length: 8 + Math.floor(Math.random() * 20)
      }));
    }, b = () => {
      document.hidden ? (cancelAnimationFrame(i), i = 0) : i || (l = 0, i = requestAnimationFrame(d));
    }, d = (r) => {
      const c = 1e3 / A;
      if (r - l < c) {
        i = requestAnimationFrame(d);
        return;
      }
      l = r, e.fillStyle = "rgba(0, 0, 0, 0.06)", e.fillRect(0, 0, s, a), E.forEach((t, T) => {
        const F = T * n;
        t.y > 0 && t.y < a && (e.fillStyle = `rgba(${g}, ${t.opacity})`, e.font = `bold ${n}px "Fira Code", monospace`, e.fillText(m[Math.floor(Math.random() * m.length)], F, t.y));
        for (let h = 1; h < t.length; h++) {
          const y = t.y - h * n;
          if (y < 0 || y > a) continue;
          const R = 1 - h / t.length;
          Math.random() < x ? e.fillStyle = `rgba(${w}, ${R * t.opacity * 0.7})` : e.fillStyle = `rgba(${M}, ${R * t.opacity * p})`, e.font = `${n}px "Fira Code", monospace`, e.fillText(m[Math.floor(Math.random() * m.length)], F, y);
        }
        t.y += n * t.speed, t.y > a + t.length * n && Math.random() > 0.97 && (t.y = -t.length * n, t.speed = 0.5 + Math.random() * 1.5, t.opacity = 0.4 + Math.random() * 0.6, t.length = 8 + Math.floor(Math.random() * 20));
      }), i = requestAnimationFrame(d);
    };
    return f(), window.addEventListener("resize", f), document.addEventListener("visibilitychange", b), i = requestAnimationFrame(d), () => {
      cancelAnimationFrame(i), window.removeEventListener("resize", f), document.removeEventListener("visibilitychange", b);
    };
  }, [n, u, g, M, w, p, x, v, A]), /* @__PURE__ */ W("canvas", { ref: $, className: H, style: { ...{
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    opacity: q
  }, ...L }, "aria-hidden": "true" });
};
export {
  G as MatrixRain,
  G as default
};
