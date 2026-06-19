"use client";

import { ImpactPriorityMatrix } from "@/registry/new-york-v4/ui/impact-priority-matrix";

export default function ImpactPriorityMatrixDemo() {
  return (
    <div className="flex w-full justify-center">
      <ImpactPriorityMatrix
        title="Optimization Opportunities"
        description="Web performance improvements ranked by effort vs impact"
      />
    </div>
  );
}
