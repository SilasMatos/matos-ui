"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, RotateCcw } from "lucide-react";
import {
  type ComponentProps,
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { useArenaReducedMotion } from "@/registry/new-york-v4/lib/arena-motion";
import {
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export type HoopOutcome = "swish" | "rim-out";

export interface HoopShotLabels {
  title: string;
  reset: string;
  shoot: string;
  points: string;
  made: string;
  streak: string;
  swish: string;
  rimOut: string;
  onFire: string;
}

export interface HoopShotProps
  extends Omit<ComponentProps<typeof Elevated>, "offset" | "title"> {
  labels: HoopShotLabels;
  offset?: number;
  /** Opt into the high-bounce `playful` tier on the scoreboard when a shot drops. */
  playful?: boolean;
  /** 0..1 chance a shot goes in. The first two attempts always fall for warm-up. */
  makeChance?: number;
  /** Consecutive makes needed for the "on fire" state. */
  fireAt?: number;
  onScore?: (points: 2 | 3) => void;
}

type Phase = "idle" | "wind" | "flight" | "result";

// Scene coordinates, viewBox 0 0 240 180.
const START = { x: 40, y: 130 };
const APEX_Y = 26;
const RIM = { x: 184, y: 74 };
const FLOOR_Y = 150;
// Sequence beats, derived from the duration tokens so the choreography and the
// tweens that run inside each beat stay in step.
const WIND_MS = Math.round(duration.fast * 1000);
const FLIGHT_MS = Math.round(duration.slow * 1000);
const RESULT_MS = Math.round(duration.slow * 1000);
const RESET_MS = Math.round(duration.moderate * 1000);

const NET_REST = "M170 76 L170 96 Q184 100 198 96 L198 76";
const NET_BULGE = "M170 76 L166 100 Q184 112 202 100 L198 76";

export const HoopShot = forwardRef<HTMLDivElement, HoopShotProps>(
  function HoopShot(
    {
      labels,
      offset = 1,
      playful = false,
      makeChance = 0.62,
      fireAt = 3,
      onScore,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const reduced = useArenaReducedMotion();
    const titleId = useId();
    const [made, setMade] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [streak, setStreak] = useState(0);
    const [points, setPoints] = useState(0);
    const [phase, setPhase] = useState<Phase>("idle");
    const [outcome, setOutcome] = useState<HoopOutcome | null>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const onFire = streak >= fireAt;
    const busy = phase !== "idle";

    const clearTimers = useCallback(() => {
      for (const timer of timers.current) clearTimeout(timer);
      timers.current = [];
    }, []);

    useEffect(() => clearTimers, [clearTimers]);

    const shoot = useCallback(() => {
      if (busy) return;
      const attemptNo = attempts + 1;
      // Warm-up: the first two always fall, so the demo opens with a make.
      const willMake = attemptNo <= 2 || Math.random() < makeChance;
      const shotPoints: 2 | 3 = Math.random() < 0.3 ? 3 : 2;

      setAttempts(attemptNo);

      const run = (fn: () => void, ms: number) => {
        timers.current.push(setTimeout(fn, ms));
      };

      const land = () => {
        setOutcome(willMake ? "swish" : "rim-out");
        setPhase("result");
        if (willMake) {
          setMade((value) => value + 1);
          setStreak((value) => value + 1);
          setPoints((value) => value + shotPoints);
          onScore?.(shotPoints);
        } else {
          setStreak(0);
        }
        run(() => setPhase("idle"), reduced ? 0 : RESULT_MS + RESET_MS);
      };

      if (reduced) {
        land();
        return;
      }

      setPhase("wind");
      run(() => setPhase("flight"), WIND_MS);
      run(land, WIND_MS + FLIGHT_MS);
    }, [busy, attempts, makeChance, reduced, onScore]);

    const reset = useCallback(() => {
      clearTimers();
      setMade(0);
      setAttempts(0);
      setStreak(0);
      setPoints(0);
      setOutcome(null);
      setPhase("idle");
    }, [clearTimers]);

    // Ball position per phase. x is linear; y carries the arc through APEX_Y.
    const ball = (() => {
      if (phase === "wind") return { x: [START.x], y: [START.y + 7] };
      if (phase === "flight")
        return {
          x: [START.x, RIM.x],
          y: [START.y, APEX_Y, RIM.y],
        };
      if (phase === "result")
        return outcome === "swish"
          ? { x: [RIM.x], y: [RIM.y + 34] }
          : { x: [RIM.x + 34], y: [FLOOR_Y] };
      return { x: [START.x], y: [START.y] };
    })();

    const ballTransition =
      phase === "flight"
        ? {
            duration: duration.slow,
            ease: ease.standard,
            y: {
              duration: duration.slow,
              times: [0, 0.46, 1],
              ease: ease.standard,
            },
          }
        : phase === "wind"
          ? { duration: duration.fast, ease: ease.accelerate }
          : phase === "result"
            ? {
                duration: duration.slow,
                ease: outcome === "swish" ? ease.accelerate : ease.decelerate,
              }
            : reduced
              ? { duration: 0 }
              : spring.moderate;

    const swished = phase === "result" && outcome === "swish" && !reduced;

    return (
      <Elevated
        ref={ref}
        offset={offset}
        aria-labelledby={titleId}
        className={cn(
          "flex w-full max-w-xs flex-col gap-3 rounded-2xl p-4 text-foreground",
          // Court ink and hardwood, token-derived, overridable at the call site.
          "[--hoop-line:var(--color-foreground)] [--hoop-wood:var(--color-muted)]",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          <p id={titleId} className="font-medium text-sm tracking-tight">
            {labels.title}
          </p>
          <div className="flex items-center gap-1">
            <AnimatePresence>
              {onFire ? (
                <motion.span
                  initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                  transition={
                    playful && !reduced ? spring.playful : spring.fast
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 font-medium text-[10px] text-primary uppercase"
                >
                  <Flame className="size-3" aria-hidden="true" />
                  {labels.onFire}
                </motion.span>
              ) : null}
            </AnimatePresence>
            <button
              type="button"
              onClick={reset}
              aria-label={labels.reset}
              className="hover-lift [--lift:1px] inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <svg
          viewBox="0 0 240 180"
          className="w-full rounded-xl"
          role="img"
          aria-label={`${labels.made}: ${made} of ${attempts}. ${labels.points}: ${points}.`}
        >
          <rect
            x="8"
            y="8"
            width="224"
            height="164"
            rx="8"
            className="fill-[var(--hoop-wood)]"
          />
          <g
            className="stroke-[var(--hoop-line)]"
            strokeWidth="1.5"
            fill="none"
            opacity="0.3"
          >
            <line x1="16" y1={FLOOR_Y} x2="224" y2={FLOOR_Y} />
            {/* three-point arc */}
            <path d="M40 172 A 118 118 0 0 1 224 96" />
          </g>

          {/* backboard + rim */}
          <g className="stroke-[var(--hoop-line)]" fill="none">
            <line
              x1="206"
              y1="34"
              x2="206"
              y2="150"
              strokeWidth="2"
              opacity="0.4"
            />
            <rect
              x="196"
              y="40"
              width="16"
              height="34"
              rx="2"
              strokeWidth="2"
              opacity="0.55"
            />
            <motion.ellipse
              cx="184"
              cy={RIM.y}
              rx="16"
              ry="3.5"
              strokeWidth="2.5"
              className="stroke-primary"
              animate={
                onFire && !reduced ? { opacity: [1, 0.55, 1] } : { opacity: 1 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: 1.4,
                      repeat: onFire ? Number.POSITIVE_INFINITY : 0,
                      ease: "easeInOut",
                    }
              }
            />
          </g>

          {/* net */}
          <motion.path
            className="stroke-[var(--hoop-line)]"
            strokeWidth="1.25"
            fill="none"
            opacity="0.5"
            initial={false}
            animate={{ d: swished ? NET_BULGE : NET_REST }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: duration.moderate, ease: ease.decelerate }
            }
          />

          {/* the ball */}
          <motion.g
            initial={false}
            animate={{ x: ball.x, y: ball.y }}
            transition={ballTransition}
            style={{
              opacity: phase === "result" && outcome === "rim-out" ? 0.9 : 1,
            }}
          >
            <circle r="7" className="fill-primary" />
            <path
              d="M-7 0 H7 M0 -7 V7"
              className="stroke-primary-foreground"
              strokeWidth="1"
              opacity="0.5"
              fill="none"
            />
          </motion.g>
        </svg>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label={labels.points}>
            <Counter
              value={points}
              playful={playful && !reduced}
              reduced={reduced}
            />
          </Stat>
          <Stat label={labels.made}>
            <span className="font-mono tabular-nums">
              {made}
              <span className="text-muted-foreground">/{attempts}</span>
            </span>
          </Stat>
          <Stat label={labels.streak}>
            <span
              className={cn("font-mono tabular-nums", onFire && "text-primary")}
            >
              {streak}
            </span>
          </Stat>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${phase}-${outcome}`}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={reduced ? { duration: 0.12 } : spring.fast}
            className="h-4 text-center text-muted-foreground text-xs"
            aria-live="polite"
          >
            {phase === "result" && outcome === "swish"
              ? labels.swish
              : phase === "result" && outcome === "rim-out"
                ? labels.rimOut
                : " "}
          </motion.p>
        </AnimatePresence>

        <button
          type="button"
          onClick={shoot}
          disabled={busy}
          className="hover-lift rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {labels.shoot}
        </button>

        {children}
      </Elevated>
    );
  },
);

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-1.5">
      <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-sm">{children}</p>
    </div>
  );
}

function Counter({
  value,
  playful,
  reduced,
}: {
  value: number;
  playful: boolean;
  reduced: boolean;
}) {
  if (reduced) {
    return <span className="font-mono tabular-nums">{value}</span>;
  }
  return (
    <span className="relative inline-flex justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={playful ? spring.playful : spring.fast}
          className="font-mono tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
