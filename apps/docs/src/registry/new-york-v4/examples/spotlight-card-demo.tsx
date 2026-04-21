import { Layers, Sparkles, Zap } from "lucide-react";
import {
  SpotlightCard,
  SpotlightCardContent,
  SpotlightCardFooter,
  SpotlightCardHeader,
} from "@/registry/new-york-v4/ui/spotlight-card";

export default function SpotlightCardDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-4">
      <SpotlightCard glow="primary" size="sm">
        <SpotlightCardHeader>
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="size-4 text-primary" />
          </div>
        </SpotlightCardHeader>
        <SpotlightCardContent>
          <h3 className="text-sm font-semibold">Rápido</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Performance otimizada com lazy loading e code splitting automático.
          </p>
        </SpotlightCardContent>
        <SpotlightCardFooter>
          <span className="text-xs text-muted-foreground">→ Saiba mais</span>
        </SpotlightCardFooter>
      </SpotlightCard>

      <SpotlightCard glow="accent" size="sm">
        <SpotlightCardHeader>
          <div className="flex size-9 items-center justify-center rounded-lg bg-chart-4/10">
            <Sparkles className="size-4 text-chart-4" />
          </div>
        </SpotlightCardHeader>
        <SpotlightCardContent>
          <h3 className="text-sm font-semibold">Moderno</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Design system construído com as melhores práticas de UI atuais.
          </p>
        </SpotlightCardContent>
        <SpotlightCardFooter>
          <span className="text-xs text-muted-foreground">→ Explorar</span>
        </SpotlightCardFooter>
      </SpotlightCard>

      <SpotlightCard glow="default" size="sm">
        <SpotlightCardHeader>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Layers className="size-4 text-foreground" />
          </div>
        </SpotlightCardHeader>
        <SpotlightCardContent>
          <h3 className="text-sm font-semibold">Composável</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Componentes modulares que se encaixam como blocos de construção.
          </p>
        </SpotlightCardContent>
        <SpotlightCardFooter>
          <span className="text-xs text-muted-foreground">→ Componentes</span>
        </SpotlightCardFooter>
      </SpotlightCard>
    </div>
  );
}
