import { cn } from "@/lib/utils";

interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  angle?: number;          // default 65
  cellSize?: number;       // default 60
  opacity?: number;        // default 0.3
  lightLineColor?: string; // default "#3b82f6"
  darkLineColor?: string;  // default "#3b82f6"
  speed?: number;          // multiplier, default 1 (15s / speed)
  animated?: boolean;      // default true
}

export function RetroGrid({
  className,
  angle = 65,
  cellSize = 60,
  opacity = 0.3,
  lightLineColor = "#3b82f6",
  darkLineColor = "#3b82f6",
  speed = 1,
  animated = true,
  ...props
}: RetroGridProps) {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
    "--animation-duration": `${15 / Math.max(speed, 10)}s`,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]",
        "opacity-[var(--opacity)]",
        className,
      )}
      style={gridStyles}
      {...props}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))] [transform-style:preserve-3d] [will-change:transform]">
        <div
          className={cn(
            animated && "animate-retro-grid-running",
            // anti-flicker & perf
            "[will-change:transform]",
            "[backface-visibility:hidden]",
            // repeating gradients = lebih stabil
            "[background-image:repeating-linear-gradient(to_right,var(--light-line)_0_2px,transparent_2px_var(--cell-size)),repeating-linear-gradient(to_bottom,var(--light-line)_0_2px,transparent_2px_var(--cell-size))]",
            "dark:[background-image:repeating-linear-gradient(to_right,var(--dark-line)_0_2px,transparent_2px_var(--cell-size)),repeating-linear-gradient(to_bottom,var(--dark-line)_0_2px,transparent_2px_var(--cell-size))]",
            "[background-repeat:repeat]",
            "[height:400vh]",
            "[width:400vw]",
            "[transform-origin:top_left]",
            "[position:absolute]",
            "[top:-200%]",
            "[left:-100%]"
          )}
          style={{
            animationDuration: animated ? "var(--animation-duration)" : undefined,
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-black/80" />
    </div>
  );
}
