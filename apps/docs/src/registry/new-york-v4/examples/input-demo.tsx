"use client";

import { useState } from "react";

import { InputField } from "@/registry/new-york-v4/ui/input";

export default function InputDemo() {
  const [email, setEmail] = useState("hello@studio.com");
  const error =
    email.length > 0 && !email.includes("@")
      ? "Enter a valid email address."
      : undefined;

  return (
    <div className="mx-auto w-full max-w-sm">
      <InputField
        type="email"
        label="Email"
        placeholder="hello@studio.com"
        description="Used for workspace notifications."
        error={error}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
    </div>
  );
}
