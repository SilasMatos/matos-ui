"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ToggleExemple() {
  const [enabled, setEnabled] = useState(false);
  const [format, setFormat] = useState<"12h" | "24h">("12h");

  useEffect(() => {
    const interval = setInterval(() => {
      setEnabled((prev) => !prev);
      setFormat((prev) => (prev === "12h" ? "24h" : "12h"));
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      data-slot="toggle-exemple"
      className="flex w-fit items-center gap-6 rounded-xl border border-border px-3 py-2"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.12, // 👈 delay em cascata
          },
        },
      }}
    >
      {/* TOGGLE */}
      <motion.button
        variants={{
          hidden: { opacity: 0, y: 6 },
          show: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={cn(
          "relative h-6 w-10 rounded-full border border-border transition-colors duration-500",
          enabled ? "bg-primary" : "bg-muted",
        )}
      >
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 140, // mais lento
            damping: 22,
            mass: 1,
          }}
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow-sm"
          animate={{
            x: enabled ? 16 : 0,
            scale: enabled ? 1.08 : 1,
          }}
        />
      </motion.button>

      {/* STATUS DOT 👇 NOVO 
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.5 },
          show: { opacity: 1, scale: 1 }
        }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-1"
      >
        <motion.div
          animate={{
            scale: enabled ? [1, 1.3, 1] : 1,
            opacity: enabled ? [0.6, 1, 0.6] : 0.4
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity
          }}
          className={cn(
            'h-2 w-2 rounded-full',
            enabled ? 'bg-green-500' : 'bg-muted-foreground'
          )}
        />
      </motion.div>

      {/* SEGMENTED CONTROL */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 6 },
          show: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex rounded-lg border border-border bg-muted p-0.5"
      >
        {(["12h", "24h"] as const).map((option) => {
          const active = format === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className="relative px-2 py-0.5 text-xs font-medium"
            >
              {active && (
                <motion.div
                  layoutId="segment"
                  className="absolute inset-0 rounded-md border border-border bg-background shadow-sm"
                  transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 26,
                  }}
                />
              )}

              <motion.span
                className="relative z-10"
                animate={{
                  opacity: active ? 1 : 0.5,
                  scale: active ? 1.06 : 1,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeInOut",
                }}
              >
                {option}
              </motion.span>
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
