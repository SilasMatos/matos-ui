"use client";

import { Gauge, Rocket, ShieldCheck } from "lucide-react";
import { ProgressOrbit } from "@/registry/new-york-v4/ui/progress-orbit";

export default function ProgressOrbitDemo() {
  return (
    <div className=" w-full max-w-[760px]  ">
      <ProgressOrbit
        size="sm"
        label="Security"
        description="Identity"
        value={72}
        icon={<ShieldCheck />}
        milestones={[
          { value: 30, label: "MFA" },
          { value: 55, label: "SAML" },
          { value: 80, label: "Audit" },
        ]}
        footer="Milestones light up as your score crosses each threshold."
      />
    </div>
  );
}
