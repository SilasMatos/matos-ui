import { TextareaField } from "@/registry/new-york-v4/ui/textarea";

export default function TextareaDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <TextareaField
        label="Additional notes"
        description="Optional. Add useful context for your request."
        placeholder="What would you like to build?"
      />
    </div>
  );
}
