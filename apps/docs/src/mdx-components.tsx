import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ChartsShowcase } from "@/components/charts-showcase";
import { CodeBlockCommand } from "@/components/code-block-command";
import { CodeTabs } from "@/components/code-tabs";
import { ComponentPreview } from "@/components/component-preview";
import { ComponentSource } from "@/components/component-source";
import { ComponentsList } from "@/components/components-list";
import { TerminalBlock } from "@/components/terminal-block";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs";
import { ComponentPreviewTabs } from "./components/component-preview-tabs";
import { cn } from "./lib/utils";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    ComponentsList,
    ChartsShowcase,
    ComponentPreview,
    ComponentSource,
    ComponentPreviewTabs,
    CodeTabs,
    Tabs,
    CodeBlockCommand,
    TerminalBlock,
    TabsContent,
    TabsList,
    TabsTrigger,
    Step: ({ className, ...props }: React.ComponentProps<"h3">) => (
      <h3
        className={cn(
          "mt-8 scroll-m-32 text-lg font-medium tracking-tight",
          className,
        )}
        {...props}
      />
    ),
    Steps: ({ className, ...props }: React.ComponentProps<"div">) => (
      <div
        className={cn(
          "steps mb-12 [counter-reset:step] md:ml-4 md:border-l md:pl-8 [&>h3]:step",
          className,
        )}
        {...props}
      />
    ),
  };
}
