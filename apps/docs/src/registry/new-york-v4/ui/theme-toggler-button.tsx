"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { flushSync } from "react-dom";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const themeTogglerButtonVariants = tv({
  base: [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent text-foreground outline-none select-none",
    "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
    "hover:bg-muted/70 active:scale-90 motion-reduce:active:scale-100",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    size: {
      sm: "size-7 [&_svg]:size-3.5",
      md: "size-8 [&_svg]:size-4",
      lg: "size-10 [&_svg]:size-[1.125rem]",
      icon: "size-9 [&_svg]:size-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/**
 * Reveal animation played on the incoming theme when the View Transitions API
 * is available. "fade" is also used as the safe fallback shape.
 */
export type ThemeTogglerButtonVariant =
  | "circle"
  | "circle-blur"
  | "iris"
  | "polygon"
  | "slide"
  | "fade";

/** Origin edge/rotation used by the reveal sweep and the icon swap. */
export type ThemeTogglerButtonDirection = "ltr" | "rtl" | "ttb" | "btt";

export type ThemeTogglerButtonMode = "light" | "dark" | "system";

type ViewTransitionLike = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

function getMaxRadius(x: number, y: number) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

function circleClipPath(x: number, y: number, radius: number) {
  return `circle(${radius}px at ${x}px ${y}px)`;
}

/** Straight curtain wipe: the far inset shrinks from 100% to 0% along `direction`. */
function insetClipPath(
  direction: ThemeTogglerButtonDirection,
  progress: number,
) {
  const hidden = `${100 - progress * 100}%`;

  switch (direction) {
    case "ltr":
      return `inset(0 ${hidden} 0 0)`;
    case "rtl":
      return `inset(0 0 0 ${hidden})`;
    case "ttb":
      return `inset(0 0 ${hidden} 0)`;
    case "btt":
      return `inset(${hidden} 0 0 0)`;
  }
}

/**
 * Diagonal wipe: both edges of the reveal travel from `originEdge` to the
 * opposite edge, but one edge is eased with an exponent so it lags behind the
 * other mid-flight and rejoins it at 0 and 1 - producing a slanted edge that
 * resolves flush at both ends of the animation.
 */
function polygonClipPath(
  direction: ThemeTogglerButtonDirection,
  progress: number,
) {
  const horizontal = direction === "ltr" || direction === "rtl";
  const originEdge = direction === "ltr" || direction === "ttb" ? 0 : 100;
  const oppositeEdge = 100 - originEdge;
  const lagged = progress ** 1.7;
  const frontA = originEdge + (oppositeEdge - originEdge) * progress;
  const frontB = originEdge + (oppositeEdge - originEdge) * lagged;

  return horizontal
    ? `polygon(${originEdge}% 0%, ${frontA}% 0%, ${frontB}% 100%, ${originEdge}% 100%)`
    : `polygon(0% ${originEdge}%, 0% ${frontA}%, 100% ${frontB}%, 100% ${originEdge}%)`;
}

type TransitionFrames = {
  keyframes: Keyframe[];
  easing: string;
};

function buildTransitionFrames(
  variant: ThemeTogglerButtonVariant,
  direction: ThemeTogglerButtonDirection,
  origin: { x: number; y: number },
): TransitionFrames {
  switch (variant) {
    case "circle-blur": {
      const radius = getMaxRadius(origin.x, origin.y);
      return {
        keyframes: [
          {
            clipPath: circleClipPath(origin.x, origin.y, 0),
            filter: "blur(18px)",
          },
          {
            clipPath: circleClipPath(origin.x, origin.y, radius),
            filter: "blur(0px)",
          },
        ],
        easing: "ease-out",
      };
    }
    case "iris": {
      const radius = getMaxRadius(origin.x, origin.y);
      return {
        keyframes: [
          { clipPath: circleClipPath(origin.x, origin.y, 0) },
          { clipPath: circleClipPath(origin.x, origin.y, radius) },
        ],
        // Overshoots past full coverage then settles back, like a lens snapping into focus.
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      };
    }
    case "polygon": {
      const steps = 8;
      const keyframes = Array.from({ length: steps + 1 }, (_, index) => ({
        clipPath: polygonClipPath(direction, index / steps),
      }));
      return { keyframes, easing: "ease-in-out" };
    }
    case "slide": {
      return {
        keyframes: [
          { clipPath: insetClipPath(direction, 0) },
          { clipPath: insetClipPath(direction, 1) },
        ],
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
      };
    }
    case "fade": {
      return {
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        easing: "ease",
      };
    }
    default: {
      const radius = getMaxRadius(origin.x, origin.y);
      return {
        keyframes: [
          { clipPath: circleClipPath(origin.x, origin.y, 0) },
          { clipPath: circleClipPath(origin.x, origin.y, radius) },
        ],
        easing: "ease-in-out",
      };
    }
  }
}

const defaultIcons: Record<ThemeTogglerButtonMode, ReactNode> = {
  light: <Sun />,
  dark: <Moon />,
  system: <Monitor />,
};

export type ThemeTogglerButtonProps = Omit<
  ComponentProps<"button">,
  "children"
> &
  VariantProps<typeof themeTogglerButtonVariants> & {
    variant?: ThemeTogglerButtonVariant;
    direction?: ThemeTogglerButtonDirection;
    modes?: ThemeTogglerButtonMode[];
    /** Duration (ms) of the reveal animation. */
    duration?: number;
    icons?: Partial<Record<ThemeTogglerButtonMode, ReactNode>>;
  };

function ThemeTogglerButton({
  variant = "circle",
  direction = "ltr",
  size = "md",
  modes = ["light", "dark"],
  duration = 650,
  icons,
  className,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: ThemeTogglerButtonProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const modeList: ThemeTogglerButtonMode[] =
    modes.length > 0 ? modes : ["light", "dark"];
  const activeMode: ThemeTogglerButtonMode =
    theme && (modeList as string[]).includes(theme)
      ? (theme as ThemeTogglerButtonMode)
      : modeList[0];
  const displayMode: ThemeTogglerButtonMode =
    activeMode === "system"
      ? "system"
      : resolvedTheme === "dark"
        ? "dark"
        : "light";

  const nextMode = useMemo(() => {
    const currentIndex = modeList.indexOf(activeMode);
    return modeList[(currentIndex + 1) % modeList.length] ?? modeList[0];
  }, [modeList, activeMode]);

  const runTransition = useCallback(
    (target: ThemeTogglerButtonMode) => {
      const doc = document as DocumentWithViewTransitions;
      const prefersReducedMotion =
        shouldReduceMotion ??
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (
        typeof doc.startViewTransition !== "function" ||
        prefersReducedMotion
      ) {
        setTheme(target);
        return;
      }

      const rect = buttonRef.current?.getBoundingClientRect();
      const origin = {
        x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      };

      const style = document.createElement("style");
      style.textContent =
        "::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }";
      document.head.appendChild(style);

      const transition = doc.startViewTransition(() => {
        flushSync(() => setTheme(target));
      });

      transition.finished.finally(() => style.remove());

      transition.ready
        .then(() => {
          const { keyframes, easing } = buildTransitionFrames(
            variant,
            direction,
            origin,
          );

          document.documentElement.animate(keyframes, {
            duration,
            easing,
            pseudoElement: "::view-transition-new(root)",
          });
        })
        .catch(() => {
          // Transition was skipped (e.g. another one started first).
        });
    },
    [direction, duration, setTheme, shouldReduceMotion, variant],
  );

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    runTransition(nextMode);
  }

  const spin = direction === "rtl" || direction === "btt" ? -1 : 1;
  const icon = icons?.[displayMode] ?? defaultIcons[displayMode];

  return (
    <button
      ref={buttonRef}
      type="button"
      data-slot="theme-toggler-button"
      aria-label={ariaLabel ?? `Switch to ${nextMode} theme`}
      onClick={handleClick}
      className={twMerge(themeTogglerButtonVariants({ size }), className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={displayMode}
          data-slot="theme-toggler-button-icon"
          className="inline-flex"
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, rotate: -90 * spin, scale: 0.4 }
          }
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={
            shouldReduceMotion
              ? undefined
              : { opacity: 0, rotate: 90 * spin, scale: 0.4 }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {icon}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export { ThemeTogglerButton };
