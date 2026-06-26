import { useEffect, useRef } from 'react';

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

interface Column {
  y: number;
  speed: number;
  opacity: number;
  length: number;
}

export interface MatrixRainProps {
  /**
   * Font size in CSS pixels. Default: 13
   */
  fontSize?: number;
  /**
   * Device pixel ratio cap. Default: 2 (prevents 3x/4x perf cost on retina)
   */
  maxDpr?: number;
  /**
   * Color of the lead character. Default: 'rgba(200, 255, 200, OPACITY)'
   */
  leadColor?: string;
  /**
   * Color of the trail characters. Default: 'rgba(0, 200, 70, OPACITY)'
   */
  trailColor?: string;
  /**
   * Color of the accent (3% chance per character). Default: 'rgba(0, 210, 210, OPACITY)'
   */
  accentColor?: string;
  /**
   * Trail fade per character (0..1). Default: 0.6
   */
  trailFade?: number;
  /**
   * Probability of accent color per character. Default: 0.03
   */
  accentProbability?: number;
  /**
   * Canvas CSS opacity. Default: 0.16
   */
  opacity?: number;
  /**
   * Custom CSS class for the canvas element. Default: 'matrix-rain'
   */
  className?: string;
  /**
   * Custom inline style for the canvas wrapper. Default: fixed inset-0 pointer-events-none z-0
   */
  style?: React.CSSProperties;
  /**
   * Respect prefers-reduced-motion. Default: true
   */
  respectReducedMotion?: boolean;
  /**
   * Target frames per second cap. Default: 35
   */
  maxFps?: number;
}

/**
 * MatrixRain — A Matrix-style digital rain animation for React.
 *
 * Features:
 * - HiDPI/retina support (capped at 2x DPR for performance)
 * - Auto-pauses when tab is hidden (battery friendly)
 * - Respects prefers-reduced-motion
 * - Frame-rate capped at 35fps by default
 * - Zero dependencies
 *
 * @example
 * ```tsx
 * import MatrixRain from '@ianalloway/matrix-rain';
 *
 * function App() {
 *   return (
 *     <div>
 *       <MatrixRain />
 *       <YourContent />
 *     </div>
 *   );
 * }
 * ```
 */
const MatrixRain = ({
  fontSize = 13,
  maxDpr = 2,
  leadColor = '200, 255, 200',
  trailColor = '0, 200, 70',
  accentColor = '0, 210, 210',
  trailFade = 0.6,
  accentProbability = 0.03,
  opacity = 0.16,
  className = 'matrix-rain',
  style,
  respectReducedMotion = true,
  maxFps = 35,
}: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let columns: Column[] = [];
    let animId: number;
    let lastTime = 0;
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.floor(cssWidth / fontSize);
      columns = Array.from({ length: cols }, () => ({
        y: Math.random() * -cssHeight,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.4 + Math.random() * 0.6,
        length: 8 + Math.floor(Math.random() * 20),
      }));
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        animId = 0;
      } else if (!animId) {
        lastTime = 0;
        animId = requestAnimationFrame(draw);
      }
    };

    const draw = (time: number) => {
      const minDelta = 1000 / maxFps;
      const delta = time - lastTime;
      if (delta < minDelta) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      columns.forEach((col, i) => {
        const x = i * fontSize;

        // Lead character — bright
        if (col.y > 0 && col.y < cssHeight) {
          ctx.fillStyle = `rgba(${leadColor}, ${col.opacity})`;
          ctx.font = `bold ${fontSize}px "Fira Code", monospace`;
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, col.y);
        }

        // Trail characters
        for (let t = 1; t < col.length; t++) {
          const ty = col.y - t * fontSize;
          if (ty < 0 || ty > cssHeight) continue;
          const fade = 1 - t / col.length;
          const isAccent = Math.random() < accentProbability;
          if (isAccent) {
            ctx.fillStyle = `rgba(${accentColor}, ${fade * col.opacity * 0.7})`;
          } else {
            ctx.fillStyle = `rgba(${trailColor}, ${fade * col.opacity * trailFade})`;
          }
          ctx.font = `${fontSize}px "Fira Code", monospace`;
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, ty);
        }

        col.y += fontSize * col.speed;
        if (col.y > cssHeight + col.length * fontSize && Math.random() > 0.97) {
          col.y = -col.length * fontSize;
          col.speed = 0.5 + Math.random() * 1.5;
          col.opacity = 0.4 + Math.random() * 0.6;
          col.length = 8 + Math.floor(Math.random() * 20);
        }
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fontSize, maxDpr, leadColor, trailColor, accentColor, trailFade, accentProbability, respectReducedMotion, maxFps]);

  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    opacity,
  };

  return <canvas ref={canvasRef} className={className} style={{ ...defaultStyle, ...style }} aria-hidden="true" />;
};

export default MatrixRain;
export { MatrixRain };
