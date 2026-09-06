"use client";

import { AvatarGroup } from "@/registry/new-york-v4/ui/avatar-group";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const TEAM = [
  { name: "Ana Ribeiro" },
  { name: "Bruno Alves" },
  { name: "Carla Mendes" },
  { name: "Diego Souza" },
  { name: "Elena Costa" },
  { name: "Felipe Lima" },
  { name: "Gabriela Nunes" },
];

export default function AvatarGroupDemo() {
  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-6 py-10">
      <Elevated
        offset={1}
        className="flex w-full flex-col gap-4 rounded-2xl p-6"
      >
        <div>
          <p className="font-semibold text-foreground text-sm">
            Project collaborators
          </p>
          <p className="text-muted-foreground text-xs">
            Hover the stack to fan it out
          </p>
        </div>
        <AvatarGroup items={TEAM} max={5} aria-label="Project collaborators" />
      </Elevated>

      <div className="flex w-full items-center justify-between gap-4">
        <AvatarGroup size="sm" items={TEAM.slice(0, 4)} />
        <AvatarGroup size="md" items={TEAM.slice(0, 4)} />
        <AvatarGroup size="lg" items={TEAM.slice(0, 4)} />
      </div>
    </div>
  );
}
