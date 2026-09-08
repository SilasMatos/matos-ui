"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImageOff } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  duration,
  revealVariants,
  withReducedMotion,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// The skeleton and the fallback are both `Elevated`, so they can animate their
// presence without a wrapping <motion.div> — DESIGN §2.6.
const MotionElevated = motion.create(Elevated);

type Status = "empty" | "loading" | "loaded" | "error";

/**
 * The two ways a dirty image URL fails a production page — Google Books being
 * the canonical offender:
 *
 * - `http://` (and protocol-relative `//`) thumbnails are blocked as mixed
 *   content on an https page. Force https.
 * - the Books content API paints a folded-corner border with `edge=curl` and
 *   returns a postage-stamp render at `zoom=1`. Drop the curl, bump the zoom.
 *
 * Pure and generic: any URL that matches nothing comes back untouched, so it is
 * safe to leave `sanitize` on for a whole list from a mixed source.
 */
export function sanitizeCoverUrl(url: string): string {
  let out = url.trim();
  if (out.startsWith("//")) out = `https:${out}`;
  out = out.replace(/^http:\/\//i, "https://");

  if (/\bbooks\.google(?:usercontent)?\./i.test(out)) {
    out = out
      .replace(/([?&])edge=curl(?:&|$)/i, "$1")
      .replace(/([?&])zoom=1(?=&|$)/i, "$1zoom=2")
      .replace(/[?&]$/, "");
  }
  return out;
}

export const coverImageVariants = tv({
  base: "not-prose relative block overflow-hidden",
  variants: {
    ratio: {
      book: "aspect-[2/3]",
      portrait: "aspect-[3/4]",
      square: "aspect-square",
      video: "aspect-video",
      wide: "aspect-[3/2]",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
    },
  },
  defaultVariants: { ratio: "book", radius: "md" },
});

export type CoverImageProps = Omit<
  ComponentProps<"div">,
  "children" | "onError" | "onLoad"
> &
  VariantProps<typeof coverImageVariants> & {
    /** The (possibly dirty, possibly missing) image URL. */
    src?: string | null;
    /** Required — names the cover whether or not the image ever loads. */
    alt: string;
    /** Fix `http://` thumbs and Google Books borders before loading. Off by default. */
    sanitize?: boolean;
    /** A `blurDataURL` or a CSS colour, shown blurred under the image while it loads. */
    placeholder?: string;
    /** What fills the frame when there is no usable image. Defaults to an icon. */
    fallback?: ReactNode;
    fit?: "cover" | "contain";
    loading?: "lazy" | "eager";
    onStatusChange?: (status: Status) => void;
  };

/**
 * An image that never shows a broken frame. Missing `src`, a 404, a mixed-content
 * block, an image that decodes to nothing — all resolve to a fallback that sits
 * on the elevation ladder (`Elevated offset={1}` over whatever substrate the
 * cover is in), not a flat `bg-muted`. So the empty cover in a table cell, in a
 * card, and in a detail dialog each read as a surface at their own depth — §2.1
 * in a component every catalogue app needs.
 *
 * Three states, two tiers: the skeleton pulses on an ambient, receding beat; the
 * image crossfades in on `fast` with a blur-to-sharp focus pull (`revealVariants`)
 * off the `placeholder`. `prefers-reduced-motion` keeps the crossfade, drops the
 * pulse and the blur.
 *
 * Generic enough for a book cover, an avatar or a product thumbnail — every
 * grubby API returns `imageLinks` half-missing.
 */
export function CoverImage({
  className,
  ratio,
  radius,
  src,
  alt,
  sanitize = false,
  placeholder,
  fallback,
  fit = "cover",
  loading = "lazy",
  onStatusChange,
  ...props
}: CoverImageProps) {
  const reduce = useReducedMotion();

  const resolved = src ? (sanitize ? sanitizeCoverUrl(src) : src.trim()) : "";
  const [status, setStatus] = useState<Status>(resolved ? "loading" : "empty");
  const imgRef = useRef<HTMLImageElement>(null);

  // Re-arm on every src change (a virtualised list reuses the node), and catch
  // the image that a cache or SSR finished before React wired up `onLoad`.
  useEffect(() => {
    if (!resolved) {
      setStatus("empty");
      return;
    }
    const img = imgRef.current;
    if (img?.complete) {
      setStatus(img.naturalWidth === 0 ? "error" : "loaded");
    } else {
      setStatus("loading");
    }
  }, [resolved]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const showFallback = status === "empty" || status === "error";
  const hasPlaceholder = placeholder != null && placeholder !== "";
  const placeholderIsUrl =
    hasPlaceholder && /^(?:data:|https?:|\/|blob:)/i.test(placeholder);

  const revealBase = revealVariants({ y: 0, blur: 6, tier: "fast" });
  const reveal = reduce ? withReducedMotion(revealBase) : revealBase;

  const onImgLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    // Some engines fire `load` for an image that decoded to nothing.
    setStatus(event.currentTarget.naturalWidth === 0 ? "error" : "loaded");
  };

  return (
    <div
      data-slot="cover-image"
      data-status={status}
      className={twMerge(coverImageVariants({ ratio, radius }), className)}
      {...props}
    >
      {hasPlaceholder && (status === "loading" || status === "loaded") && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
          initial={false}
          animate={{ opacity: status === "loaded" ? 0 : 1 }}
          transition={{ duration: duration.fast }}
        >
          {placeholderIsUrl ? (
            // biome-ignore lint/performance/noImgElement: registry components must work outside Next.js.
            <img
              src={placeholder}
              alt=""
              aria-hidden="true"
              className="size-full scale-110 object-cover blur-xl"
            />
          ) : (
            <div
              className="size-full"
              style={{ backgroundColor: placeholder }}
            />
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {status === "loading" && !hasPlaceholder && (
          <MotionElevated
            key="skeleton"
            offset={1}
            shadowLevel={1}
            className="absolute inset-0 rounded-[inherit]"
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
          >
            <motion.div
              aria-hidden="true"
              className="size-full bg-foreground/8"
              animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={
                reduce
                  ? undefined
                  : {
                      // Three ambient beats — a slow, receding pulse, never a strobe.
                      duration: duration.slower * 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }
              }
            />
          </MotionElevated>
        )}
      </AnimatePresence>

      {resolved && !showFallback && (
        // biome-ignore lint/performance/noImgElement: registry components must work outside Next.js.
        <motion.img
          key={resolved}
          ref={imgRef}
          src={resolved}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={onImgLoad}
          onError={() => setStatus("error")}
          variants={reveal}
          initial="hidden"
          animate={status === "loaded" ? "visible" : "hidden"}
          className={twMerge(
            "absolute inset-0 size-full rounded-[inherit]",
            fit === "cover" ? "object-cover" : "object-contain",
          )}
        />
      )}

      {showFallback && (
        <Elevated
          offset={1}
          shadowLevel={1}
          role="img"
          aria-label={alt}
          className="absolute inset-0 grid place-items-center rounded-[inherit] text-muted-foreground [&_svg]:size-[28%] [&_svg]:max-h-10 [&_svg]:min-h-5 [&_svg]:max-w-10"
        >
          {fallback ?? <ImageOff strokeWidth={1.5} aria-hidden="true" />}
        </Elevated>
      )}
    </div>
  );
}
