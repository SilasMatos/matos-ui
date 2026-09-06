"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import {
  type ComponentProps,
  forwardRef,
  useCallback,
  useEffect,
  useId,
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

export type RallyPlayer = 0 | 1;

/**
 * The whole match, as data. `points` are raw counts (a game is won at 4+ with a
 * two-point lead); `formatGameScore` turns them into 0/15/30/40/Ad for display.
 * A set is won at six games with a two-game lead, or in a first-to-seven
 * tiebreak at 6-6. The match is best of three sets.
 */
export type RallyMatchState = {
  sets: [number, number];
  games: [number, number];
  points: [number, number];
  tiebreak: boolean;
  server: RallyPlayer;
  /** The player who just won a game/set/match, for the announce line. Cleared on the next point. */
  lastEvent: {
    type: "point" | "game" | "set" | "match";
    player: RallyPlayer;
  } | null;
  winner: RallyPlayer | null;
};

export function createRallyMatch(server: RallyPlayer = 0): RallyMatchState {
  return {
    sets: [0, 0],
    games: [0, 0],
    points: [0, 0],
    tiebreak: false,
    server,
    lastEvent: null,
    winner: null,
  };
}

const other = (player: RallyPlayer): RallyPlayer => (player === 0 ? 1 : 0);

/** Points needed and lead needed to close a game or a tiebreak. */
function closesGame(a: number, b: number, tiebreak: boolean) {
  const target = tiebreak ? 7 : 4;
  return a >= target && a - b >= 2;
}

/**
 * Applies one point to the match. Pure — the component holds the state and the
 * test drives this directly.
 */
export function scoreRallyPoint(
  state: RallyMatchState,
  winner: RallyPlayer,
): RallyMatchState {
  if (state.winner !== null) return state;

  const points: [number, number] = [...state.points];
  points[winner] += 1;

  if (!closesGame(points[winner], points[other(winner)], state.tiebreak)) {
    return { ...state, points, lastEvent: { type: "point", player: winner } };
  }

  // Game (or tiebreak) goes to `winner`.
  const games: [number, number] = [...state.games];
  // A tiebreak result is always recorded as 7-6.
  games[winner] = state.tiebreak ? 7 : games[winner] + 1;

  const setClosed =
    (games[winner] >= 6 && games[winner] - games[other(winner)] >= 2) ||
    games[winner] === 7;

  if (!setClosed) {
    const enteringTiebreak = games[0] === 6 && games[1] === 6;
    return {
      ...state,
      games,
      points: [0, 0],
      tiebreak: enteringTiebreak,
      server: other(state.server),
      lastEvent: { type: "game", player: winner },
    };
  }

  const sets: [number, number] = [...state.sets];
  sets[winner] += 1;
  const matchClosed = sets[winner] >= 2;

  return {
    ...state,
    sets,
    games: [0, 0],
    points: [0, 0],
    tiebreak: false,
    server: other(state.server),
    lastEvent: { type: matchClosed ? "match" : "set", player: winner },
    winner: matchClosed ? winner : null,
  };
}

const GAME_POINTS = ["0", "15", "30", "40"] as const;

/** The pair of strings shown in the game column, e.g. ["30", "40"] or ["Ad", "40"]. */
export function formatGameScore(
  points: [number, number],
  tiebreak: boolean,
  adLabel: string,
): { left: string; right: string; deuce: boolean } {
  if (tiebreak) {
    return {
      left: String(points[0]),
      right: String(points[1]),
      deuce: false,
    };
  }
  const [a, b] = points;
  if (a >= 3 && b >= 3) {
    if (a === b) return { left: "40", right: "40", deuce: true };
    return a > b
      ? { left: adLabel, right: "40", deuce: false }
      : { left: "40", right: adLabel, deuce: false };
  }
  return {
    left: GAME_POINTS[Math.min(a, 3)],
    right: GAME_POINTS[Math.min(b, 3)],
    deuce: false,
  };
}

export interface RallyCourtLabels {
  title: string;
  reset: string;
  you: string;
  opponent: string;
  serving: string;
  pointYou: string;
  pointOpponent: string;
  inRally: string;
  deuce: string;
  advantage: string;
  gameWon: string;
  setWon: string;
  matchWon: string;
}

export interface RallyCourtProps
  extends Omit<ComponentProps<typeof Elevated>, "offset" | "title"> {
  labels: RallyCourtLabels;
  offset?: number;
  /** Opt into the high-bounce `playful` tier on the point-winning ball. Off by default. */
  playful?: boolean;
  defaultServer?: RallyPlayer;
  onPoint?: (winner: RallyPlayer) => void;
  onMatchEnd?: (winner: RallyPlayer) => void;
}

// Court geometry, top-down. "You" defend the bottom half.
const NET_Y = 150;
// The two ends of the cross-court rally, and the corner each point flies to.
const RALLY_POS = [
  { x: 72, y: 196 },
  { x: 128, y: 104 },
] as const;
const CORNER = [
  { x: 46, y: 268 },
  { x: 154, y: 32 },
] as const;
const RALLY_FLIP_MS = 620;

export const RallyCourt = forwardRef<HTMLDivElement, RallyCourtProps>(
  function RallyCourt(
    {
      labels,
      offset = 1,
      playful = false,
      defaultServer = 0,
      onPoint,
      onMatchEnd,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const reduced = useArenaReducedMotion();
    const titleId = useId();
    const [match, setMatch] = useState(() => createRallyMatch(defaultServer));
    const [ballAtTop, setBallAtTop] = useState(false);
    const [flight, setFlight] = useState<RallyPlayer | null>(null);

    const rallying = match.winner === null && flight === null;

    // The rally: the ball springs across the net on the `moderate` tier while
    // the point is live. The interval is a cadence, not an animation timing.
    useEffect(() => {
      if (!rallying || reduced) return;
      const id = setInterval(() => setBallAtTop((top) => !top), RALLY_FLIP_MS);
      return () => clearInterval(id);
    }, [rallying, reduced]);

    const award = useCallback(
      (winner: RallyPlayer) => {
        if (match.winner !== null) return;
        setFlight(winner);
        setMatch((current) => {
          const next = scoreRallyPoint(current, winner);
          onPoint?.(winner);
          if (next.winner !== null) onMatchEnd?.(next.winner);
          return next;
        });
        // Let the winning ball land, then resume the rally.
        window.setTimeout(() => setFlight(null), reduced ? 0 : 420);
      },
      [match.winner, onPoint, onMatchEnd, reduced],
    );

    const reset = useCallback(() => {
      setFlight(null);
      setBallAtTop(false);
      setMatch(createRallyMatch(defaultServer));
    }, [defaultServer]);

    const score = formatGameScore(match.points, match.tiebreak, "Ad");

    const announce = (() => {
      const event = match.lastEvent;
      const name = event
        ? event.player === 0
          ? labels.you
          : labels.opponent
        : "";
      if (event?.type === "match") return format(labels.matchWon, name);
      if (event?.type === "set") return format(labels.setWon, name);
      if (event?.type === "game") return format(labels.gameWon, name);
      if (score.deuce) return labels.deuce;
      if (score.left === "Ad" || score.right === "Ad") {
        return format(
          labels.advantage,
          score.left === "Ad" ? labels.you : labels.opponent,
        );
      }
      return labels.inRally;
    })();

    const rippleNet =
      match.lastEvent != null && match.lastEvent.type !== "point";

    const ballTarget =
      match.winner !== null
        ? CORNER[match.winner]
        : flight !== null
          ? CORNER[flight]
          : reduced
            ? RALLY_POS[0]
            : RALLY_POS[ballAtTop ? 1 : 0];
    const ballTransition =
      flight !== null
        ? playful && !reduced
          ? spring.playful
          : spring.slow
        : reduced
          ? { duration: 0 }
          : spring.moderate;

    return (
      <Elevated
        ref={ref}
        offset={offset}
        aria-labelledby={titleId}
        className={cn(
          "flex w-full max-w-sm flex-col gap-3 rounded-2xl p-4 text-foreground",
          // Court ink and surface, overridable at the call site. Derived from
          // theme tokens — no fixed sport colour (Arena rule 4.1).
          "[--rally-line:var(--color-foreground)] [--rally-turf:var(--color-muted)]",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          <p id={titleId} className="font-medium text-sm tracking-tight">
            {labels.title}
          </p>
          <button
            type="button"
            onClick={reset}
            aria-label={labels.reset}
            className="hover-lift [--lift:1px] inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        </div>

        <svg
          viewBox="0 0 200 300"
          className="w-full rounded-xl"
          role="img"
          aria-label={`${labels.you} ${match.games[0]}, ${labels.opponent} ${match.games[1]}`}
        >
          <rect
            x="10"
            y="10"
            width="180"
            height="280"
            rx="8"
            className="fill-[var(--rally-turf)]"
          />
          <g
            className="stroke-[var(--rally-line)]"
            strokeWidth="1.5"
            fill="none"
            opacity="0.35"
          >
            {/* doubles + singles lines, baselines */}
            <rect x="24" y="24" width="152" height="252" />
            <line x1="52" y1="24" x2="52" y2="276" />
            <line x1="148" y1="24" x2="148" y2="276" />
            {/* service boxes */}
            <line x1="52" y1="96" x2="148" y2="96" />
            <line x1="52" y1="204" x2="148" y2="204" />
            <line x1="100" y1="96" x2="100" y2="204" />
          </g>
          {/* net — a quick weight pulse on a game/set/match, no transform so
              there is no SVG transform-origin to get wrong. */}
          <motion.line
            x1="16"
            x2="184"
            y1={NET_Y}
            y2={NET_Y}
            className="stroke-[var(--rally-line)]"
            strokeDasharray="3 3"
            initial={false}
            animate={
              rippleNet && !reduced
                ? { strokeWidth: [2.5, 5, 2.5], opacity: [0.55, 0.9, 0.55] }
                : { strokeWidth: 2.5, opacity: 0.55 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : { duration: duration.moderate, ease: ease.standard }
            }
          />
          {/* serve marker on the serving side's baseline */}
          <motion.circle
            r="2.5"
            cx="100"
            className="fill-[var(--rally-line)]"
            opacity="0.5"
            animate={{ cy: match.server === 0 ? 270 : 30 }}
            transition={reduced ? { duration: 0 } : spring.moderate}
          />
          {/* the ball */}
          <motion.g
            initial={false}
            animate={{ x: ballTarget.x, y: ballTarget.y }}
            transition={ballTransition}
          >
            <circle r="5" className="fill-primary" />
          </motion.g>
        </svg>

        <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-muted-foreground">{labels.you}</span>
          <span className="flex items-center gap-2 font-mono tabular-nums">
            <SetPip value={match.sets[0]} />
            <span className="w-4 text-center text-muted-foreground">
              {match.games[0]}
            </span>
            <ScoreCell value={score.left} highlight={rallying} />
          </span>
          <span className="text-muted-foreground">
            {labels.opponent}
            {match.server === 1 ? (
              <span className="ml-1.5 text-[10px] text-primary uppercase">
                {labels.serving}
              </span>
            ) : null}
          </span>
          <span className="flex items-center gap-2 font-mono tabular-nums">
            <SetPip value={match.sets[1]} />
            <span className="w-4 text-center text-muted-foreground">
              {match.games[1]}
            </span>
            <ScoreCell value={score.right} highlight={rallying} />
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={announce}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={reduced ? { duration: 0.12 } : spring.moderate}
            className="text-center text-muted-foreground text-xs"
            aria-live="polite"
          >
            {announce}
          </motion.p>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => award(0)}
            disabled={match.winner !== null}
            className="hover-lift rounded-lg border border-border bg-muted px-3 py-2 font-medium text-xs text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {labels.pointYou}
          </button>
          <button
            type="button"
            onClick={() => award(1)}
            disabled={match.winner !== null}
            className="hover-lift rounded-lg border border-border bg-muted px-3 py-2 font-medium text-xs text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {labels.pointOpponent}
          </button>
        </div>

        {children}
      </Elevated>
    );
  },
);

function format(template: string, value: string) {
  return template.replace("{player}", value);
}

function ScoreCell({
  value,
  highlight,
}: {
  value: string;
  highlight: boolean;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={spring.fast}
        className={cn(
          "inline-block w-7 text-center font-semibold",
          highlight ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

function SetPip({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[0, 1].map((index) => (
        <span
          key={index}
          className={cn(
            "size-1.5 rounded-full transition-colors",
            index < value ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}
