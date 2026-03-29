"use client";

import { Switch } from "@/registry/new-york-v4/ui/switch";

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Formas
        </p>
        <div className="flex items-center gap-6">
          <Switch defaultChecked aria-label="Pill" />
          <Switch shape="rectangle" defaultChecked aria-label="Retangular" />
          <Switch
            shape="rectangle"
            variant="outline"
            defaultChecked
            aria-label="Retangular outline"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Com conteúdo
        </p>
        <div className="flex items-center gap-6">
          <Switch content="icon" defaultChecked aria-label="Ícone ligado" />
          <Switch content="icon" aria-label="Ícone desligado" />
          <Switch content="label" defaultChecked aria-label="Label ligado" />
          <Switch content="label" aria-label="Label desligado" />
        </div>
      </section>
    </div>
  );
}
