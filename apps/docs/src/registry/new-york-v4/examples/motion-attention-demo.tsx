"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import {
  attentionPulse,
  attentionShake,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const BALANCE = 1250;

export default function MotionAttentionDemo() {
  const reduced = useReducedMotion() ?? false;
  const amountId = useId();
  const [amount, setAmount] = useState("2000");
  const [shake, setShake] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [sent, setSent] = useState(0);

  const parsed = Number(amount);
  const invalid = !Number.isFinite(parsed) || parsed <= 0 || parsed > BALANCE;

  const confirm = () => {
    if (invalid) {
      // Attention cues are one-shot: flip the variant on, then back, so the
      // same failure can be signalled twice in a row.
      setShake(true);
      return;
    }
    setSent((count) => count + 1);
    setPulse(true);
  };

  return (
    <Elevated offset={1} className="w-full max-w-sm space-y-4 rounded-2xl p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-muted-foreground text-xs">Available</span>
        <motion.span
          variants={reduced ? undefined : attentionPulse}
          animate={pulse ? "pulse" : undefined}
          onAnimationComplete={() => setPulse(false)}
          className="font-semibold text-foreground text-lg tabular-nums"
        >
          ${(BALANCE - sent * 10).toLocaleString("en-US")}
        </motion.span>
      </div>

      <motion.div
        className="space-y-1.5"
        variants={reduced ? undefined : attentionShake}
        animate={shake ? "shake" : undefined}
        onAnimationComplete={() => setShake(false)}
      >
        <label
          htmlFor={amountId}
          className="block text-[11px] font-medium text-muted-foreground"
        >
          Amount to send
        </label>
        <input
          id={amountId}
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-9 w-full rounded-xl bg-muted/40 px-3 text-sm text-foreground tabular-nums",
            "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            "aria-invalid:ring-2 aria-invalid:ring-destructive/35",
          )}
        />
        <p className="text-[11px] text-muted-foreground">
          {invalid
            ? "Over the available balance — Confirm to see the shake."
            : "Confirm to see the balance pulse."}
        </p>
      </motion.div>

      <Button className="w-full" onClick={confirm}>
        Confirm transfer
      </Button>
    </Elevated>
  );
}
