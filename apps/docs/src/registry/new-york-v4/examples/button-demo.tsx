"use client";

import { useState } from "react";

import { Button } from "@/registry/new-york-v4/ui/button";

export default function ButtonDemo() {
  const [isLoading, setIsLoading] = useState(false);

  function handleLoading() {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button
        loading={isLoading}
        loadingText="Saving..."
        onClick={handleLoading}
      >
        Save changes
      </Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
