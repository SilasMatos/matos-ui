"use client";

import { useState } from "react";

import { PasswordInput } from "@/registry/new-york-v4/ui/password-input";

export default function PasswordInputDemo() {
  const [password, setPassword] = useState("Matos");

  return (
    <div className="mx-auto w-full max-w-sm py-32">
      <PasswordInput
        label="Password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter a secure password"
        error={
          password.length > 0 && password.length < 8
            ? "Password is still too short."
            : undefined
        }
      />
    </div>
  );
}
