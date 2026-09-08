"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { cn } from "@/lib/utils";
import {
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";

const SkeletonMorphContext = createContext<{ loading: boolean }>({
  loading: false,
});

/**
 * The sweep is one gentle-tier beat — unhurried, with a rest between passes so
 * it recedes instead of nagging. It is pure ambient decoration: under
 * `prefers-reduced-motion` it is not rendered at all (the flat fill still marks
 * the box; the crossfade to content still runs, because *that* is necessary
 * motion, not decoration).
 */
const SWEEP_SECONDS = Math.round(duration.slower * 2.5 * 100) / 100;

function Sweep() {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 block w-[55%] bg-linear-to-r from-transparent via-foreground/12 to-transparent"
      initial={{ x: "-120%" }}
      animate={{ x: "300%" }}
      transition={{
        duration: SWEEP_SECONDS,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        repeatDelay: duration.moderate,
      }}
    />
  );
}

export type SkeletonMorphProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & {
  /** While `true`, every `Skel` inside shows its shimmer instead of its content. */
  loading: boolean;
  children: ReactNode;
  /** Root element. `span` when the boundary must sit inline. */
  as?: "div" | "span";
};

/**
 * A skeleton whose geometry *is* the content's geometry. You lay the screen out
 * once and wrap each data-bound piece in `Skel`; while `loading`, those pieces
 * render as a shimmer of exactly their final size and radius, so the arrival is
 * a crossfade in place — not a rectangle being swapped for real content and
 * everything jumping.
 *
 * Surface: nothing here elevates. The shimmer fill is an alpha of the
 * foreground, so a `Skel` reads on whatever rung its content sits on — same
 * offset as the content, which is the requirement, not a detail.
 *
 * Motion: the shimmer sweep rides a gentle, receding beat; the crossfade to
 * content is `fast` — it responds. The root carries `layout`, so any residual
 * size difference between a `Skel` and its content settles as a morph rather
 * than a snap. `prefers-reduced-motion` drops the sweep entirely and the
 * height animation; the crossfade stays.
 */
export function SkeletonMorph({
  loading,
  children,
  as = "div",
  className,
  ...props
}: SkeletonMorphProps) {
  const reduce = useReducedMotion();
  const Comp = as === "span" ? motion.span : motion.div;

  return (
    <SkeletonMorphContext.Provider value={{ loading }}>
      <Comp
        data-slot="skeleton-morph"
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        layout={!reduce}
        transition={reduce ? { duration: 0 } : spring.moderate}
        className={cn(className)}
        {...props}
      >
        {children}
      </Comp>
    </SkeletonMorphContext.Provider>
  );
}

export type SkelProps = Omit<
  ComponentPropsWithoutRef<"span">,
  | "children"
  | "className"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
> & {
  /**
   * The box: its size and radius are the shimmer's size and radius *and* the
   * frame the content is clipped to, so write them to match the real content
   * (`h-4 w-40`, `size-10 rounded-full`, `aspect-[2/3]`).
   */
  className?: string;
  children?: ReactNode;
  /** Override the boundary's `loading`. Set `loading` with no parent for a skeleton that never resolves. */
  loading?: boolean;
  as?: "span" | "div";
};

/**
 * One morphing slot. The box `className` describes is held in *both* phases, so
 * the content clips to exactly where the shimmer was and the swap is a pure
 * crossfade in place — no reflow. Size it to match the content (`h-5 w-40`,
 * `size-10 rounded-full`, `aspect-[2/3]`), and clamp the content to fit
 * (`truncate`, `line-clamp-3`, `object-cover`). Any small residual the
 * boundary root's `layout` settles as a morph.
 */
export function Skel({
  className,
  children,
  loading: loadingProp,
  as = "span",
  ...props
}: SkelProps) {
  const ctx = useContext(SkeletonMorphContext);
  const reduce = useReducedMotion();
  const loading = loadingProp ?? ctx.loading;
  const Comp = as === "div" ? "div" : "span";

  const fade = reduce
    ? { duration: 0 }
    : { duration: duration.fast, ease: ease.standard };

  return (
    <Comp
      data-slot="skel"
      data-loading={loading || undefined}
      className={cn("relative block overflow-hidden", className)}
      {...props}
    >
      <motion.span
        className="block h-full"
        initial={false}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={fade}
        aria-hidden={loading || undefined}
      >
        {children}
      </motion.span>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-foreground/8"
        initial={false}
        animate={{ opacity: loading ? 1 : 0 }}
        transition={fade}
      >
        {loading && !reduce ? <Sweep /> : null}
      </motion.span>
    </Comp>
  );
}
