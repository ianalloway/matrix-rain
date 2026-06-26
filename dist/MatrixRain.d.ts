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
declare const MatrixRain: ({ fontSize, maxDpr, leadColor, trailColor, accentColor, trailFade, accentProbability, opacity, className, style, respectReducedMotion, maxFps, }: MatrixRainProps) => import("react").JSX.Element;
export default MatrixRain;
export { MatrixRain };
