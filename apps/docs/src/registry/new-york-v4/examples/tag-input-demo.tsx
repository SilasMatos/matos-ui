"use client";

import { useState } from "react";

import { TagInput } from "@/registry/new-york-v4/ui/tag-input";

const FRAMEWORKS = [
  "React",
  "Next.js",
  "Vue",
  "Svelte",
  "Solid",
  "Astro",
  "Remix",
  "Nuxt",
];

export default function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(["React", "Next.js"]);
  const [free, setFree] = useState<string[]>([]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <TagInput
        label="Stack"
        value={tags}
        onValueChange={setTags}
        suggestions={FRAMEWORKS}
        max={5}
        description="Pick from the list or type your own. Up to 5."
      />

      <TagInput
        label="Keywords"
        value={free}
        onValueChange={setFree}
        placeholder="Type, press Enter, paste a,b,c"
        validate={(tag) =>
          tag.length <= 20 || "Keep keywords under 20 characters."
        }
      />
    </div>
  );
}
