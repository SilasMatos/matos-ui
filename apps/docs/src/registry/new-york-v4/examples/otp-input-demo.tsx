"use client";

import { useState } from "react";

import { OtpInput } from "@/registry/new-york-v4/ui/otp-input";

const DEMO_CODE = "123456";

export default function OtpInputDemo() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [verified, setVerified] = useState(false);

  function handleChange(next: string) {
    setValue(next);
    if (error) {
      setError(undefined);
    }
    if (verified) {
      setVerified(false);
    }
  }

  function handleComplete(next: string) {
    if (next === DEMO_CODE) {
      setVerified(true);
      setError(undefined);
    } else {
      setError("Invalid code. Try 123456.");
      setVerified(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <OtpInput
        label="Verification code"
        description={
          verified
            ? "Code verified — welcome back."
            : "Enter the 6-digit code (try 123456)."
        }
        error={error}
        value={value}
        onChange={handleChange}
        onComplete={handleComplete}
        groupSize={3}
      />

      <div className="flex flex-col gap-3 border-border/60 border-t pt-6">
        <span className="text-muted-foreground text-xs">Sizes</span>
        <div className="flex flex-wrap items-end gap-6">
          <OtpInput size="sm" length={4} defaultValue="12" />
          <OtpInput size="md" length={4} defaultValue="34" />
          <OtpInput size="lg" length={4} defaultValue="56" />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-border/60 border-t pt-6">
        <span className="text-muted-foreground text-xs">
          Subtle, masked & disabled
        </span>
        <div className="flex flex-wrap items-center gap-6">
          <OtpInput variant="subtle" length={5} defaultValue="42" />
          <OtpInput mask length={5} defaultValue="903" />
          <OtpInput disabled length={4} defaultValue="7788" />
        </div>
      </div>
    </div>
  );
}
