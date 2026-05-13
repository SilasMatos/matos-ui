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
          <h3 className="text-sm font-semibold">Fast</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Optimized performance with lazy loading and automatic code
            splitting.
          </p>
        </SpotlightCardContent>
        <SpotlightCardFooter>
          <span className="text-xs text-muted-foreground">→ Learn more</span>
        </SpotlightCardFooter>
      </SpotlightCard>

      <SpotlightCard glow="accent" size="sm">
        <SpotlightCardHeader>
          <div className="flex size-9 items-center justify-center rounded-lg bg-chart-4/10">
            <Sparkles className="size-4 text-chart-4" />
          </div>
        </SpotlightCardHeader>
        <SpotlightCardContent>
          <h3 className="text-sm font-semibold">Modern</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            A design system built with current UI best practices.
          </p>
        </SpotlightCardContent>
        <SpotlightCardFooter>
          <span className="text-xs text-muted-foreground">→ Explore</span>
        </SpotlightCardFooter>
      </SpotlightCard>

      <SpotlightCard glow="default" size="sm">
        <SpotlightCardHeader>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Layers className="size-4 text-foreground" />
          </div>
        </SpotlightCardHeader>
        <SpotlightCardContent>
          <h3 className="text-sm font-semibold">Composable</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Modular components that fit together as building blocks.
          </p>
        </SpotlightCardContent>
        <SpotlightCardFooter>
          <span className="text-xs text-muted-foreground">→ Components</span>
        </SpotlightCardFooter>
      </SpotlightCard>
    </div>
  );
}
