"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ComponentProps, useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const feedbackCardVariants = tv({
  base: [
    "w-full overflow-hidden rounded-[20px] border border-border",
    "bg-secondary text-foreground",
  ],
  variants: {
    size: {
      sm: "max-w-[320px]",
      md: "max-w-[380px]",
      lg: "max-w-[440px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type FeedbackOption = {
  value: string;
  emoji: string;
  label: string;
};

export type FeedbackCardProps = ComponentProps<"div"> &
  VariantProps<typeof feedbackCardVariants> & {
    title?: string;
    subtitle?: string;
    options?: FeedbackOption[];
    onSubmit?: (data: { rating: FeedbackOption; message: string }) => void;
    successTitle?: string;
    successDescription?: string;
  };

const defaultOptions: FeedbackOption[] = [
  { value: "terrible", emoji: "😡", label: "Terrible" },
  { value: "bad", emoji: "😕", label: "Bad" },
  { value: "okay", emoji: "😐", label: "Ok" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "amazing", emoji: "🤩", label: "Amazing" },
];

type Step = "rating" | "message" | "success";

function AnimatedCheck() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.15,
      }}
      className="flex size-14 items-center justify-center rounded-full bg-chart-2/15"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-7 text-chart-2"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <title>Success</title>
        <motion.path
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.65, 0, 0.35, 1],
            delay: 0.35,
          }}
        />
      </svg>
    </motion.div>
  );
}

type EmojiButtonProps = {
  option: FeedbackOption;
  index: number;
  isSelected: boolean;
  onSelect: (option: FeedbackOption) => void;
};

function EmojiButton({
  option,
  index,
  isSelected,
  onSelect,
}: EmojiButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06 + 0.1,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.25, y: -4 }}
      whileTap={{ scale: 0.9 }}
      className={twMerge(
        "group flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected ? "bg-primary/10" : "hover:bg-muted",
      )}
      aria-label={option.label}
    >
      <span
        className="text-3xl leading-none select-none"
        role="img"
        aria-hidden="true"
      >
        {option.emoji}
      </span>
      <span
        className={twMerge(
          "text-[10px] font-medium transition-colors",
          isSelected ? "text-primary" : "text-muted-foreground/70",
        )}
      >
        {option.label}
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FeedbackCard({
  className,
  size,
  title = "How was your experience?",
  subtitle = "Your feedback helps us improve",
  options = defaultOptions,
  onSubmit,
  successTitle = "Thanks for your feedback!",
  successDescription = "Your rating was sent successfully.",
  ...props
}: FeedbackCardProps) {
  const [step, setStep] = useState<Step>("rating");
  const [selected, setSelected] = useState<FeedbackOption | null>(null);
  const [message, setMessage] = useState("");

  const handleSelect = useCallback((option: FeedbackOption) => {
    setSelected(option);
    setTimeout(() => setStep("message"), 280);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) {
      onSubmit?.({ rating: selected, message });
    }
    setStep("success");
  }, [selected, message, onSubmit]);

  const handleReset = useCallback(() => {
    setStep("rating");
    setSelected(null);
    setMessage("");
  }, []);

  return (
    <motion.div
      data-slot="feedback-card"
      layout
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 30 },
      }}
      className={twMerge(feedbackCardVariants({ size }), className)}
      {...(props as object)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === "rating" && (
          <motion.div
            key="rating"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <div className="space-y-1 px-5  ">
              <motion.h3
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-base font-semibold"
              >
                {title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            </div>

            <div className="mx-2 mb-2 overflow-hidden rounded-xl bg-card p-4">
              <div className="flex items-center justify-between">
                {options.map((option, i) => (
                  <EmojiButton
                    key={option.value}
                    option={option}
                    index={i}
                    isSelected={selected?.value === option.value}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === "message" && selected && (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between px-5  ">
              <div className="">
                <motion.h3
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-base font-semibold"
                >
                  Tell us more
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  What can we improve?
                </motion.p>
              </div>

              {/* Floating emoji badge */}
              <motion.div
                layoutId={`emoji-${selected.value}`}
                className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1"
              >
                <span className="text-lg leading-none select-none">
                  {selected.emoji}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {selected.label}
                </span>
              </motion.div>
            </div>

            {/* Inner Panel with textarea */}
            <div className="mx-2 mb-2 space-y-3 overflow-hidden rounded-xl bg-card p-4">
              <motion.textarea
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback here... (optional)"
                rows={3}
                className={twMerge(
                  "w-full resize-none rounded-lg border border-border bg-secondary/50 px-3 py-2.5",
                  "text-sm text-foreground placeholder:text-muted-foreground/50",
                  "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200",
                )}
              />

              <div className="flex items-center justify-between">
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.18 }}
                  onClick={() => {
                    setStep("rating");
                    setSelected(null);
                  }}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← Back
                </motion.button>

                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  className={twMerge(
                    "rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground",
                    "transition-colors hover:bg-primary/90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  Send feedback
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mx-2 my-2 flex flex-col items-center gap-3 overflow-hidden rounded-xl bg-card px-6 py-8 text-center">
              <AnimatedCheck />

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm font-semibold"
              >
                {successTitle}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[12px] leading-relaxed text-muted-foreground"
              >
                {successDescription}
              </motion.p>

              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="mt-1 text-xs text-muted-foreground/70 transition-colors hover:text-foreground border border-muted rounded-lg px-3 py-1 hover:border-foreground/30"
              >
                Send another feedback
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
