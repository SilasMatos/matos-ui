import { highlight } from "fumadocs-core/highlight";
import { Pre } from "fumadocs-ui/components/codeblock";

import { BlockCodeTabs } from "@/components/block-code-tabs";
import { getRegistryItem } from "@/lib/registry";
import { cn } from "@/lib/utils";

export async function BlockCodePanel({ id }: { id: string }) {
  const item = await getRegistryItem(id);

  if (!item?.files?.length) {
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
        Source code is not available for this block.
      </div>
    );
  }

  const files = await Promise.all(
    item.files.map(async (file, index) => {
      const code = file.content ?? "";
      const lang = file.path.split(".").pop() ?? "tsx";
      const rendered = await highlight(code, {
        lang,
        components: {
          pre: (props) => (
            <Pre {...props} className={cn(props.className, "text-[13px]")} />
          ),
        },
      });

      return {
        path: file.path,
        code,
        rendered,
        isMain: index === 0,
      };
    }),
  );

  return <BlockCodeTabs files={files} />;
}
