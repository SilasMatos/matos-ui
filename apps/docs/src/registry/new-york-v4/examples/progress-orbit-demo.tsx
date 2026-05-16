"use client";

import { ShieldCheck } from "lucide-react";

import { ProgressOrbit } from "@/registry/new-york-v4/ui/progress-orbit";

export default function ProgressOrbitDemo() {
  return (
    <div className="flex w-full justify-center">
      <ProgressOrbit
        className="max-w-[360px]"
        label="Security"
        description="Identity posture"
        value={72}
        tone="primary"
        icon={<ShieldCheck />}
        milestones={[
          { value: 30, label: "MFA" },
          { value: 55, label: "SAML" },
          { value: 80, label: "Audit" },
        ]}
        footer="3 checks verified"
      />
    </div>
  );
}
