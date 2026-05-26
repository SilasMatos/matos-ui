import { FormGrid, FormGridItem } from "@/registry/new-york-v4/ui/form-grid";
import { FormSection } from "@/registry/new-york-v4/ui/form-section";
import { InputField } from "@/registry/new-york-v4/ui/input";
import { TextareaField } from "@/registry/new-york-v4/ui/textarea";

export default function FormGridDemo() {
  return (
    <FormSection
      title="Shipping address"
      description="One column on small screens and compact multi-column composition above it."
      className="mx-auto w-full max-w-3xl"
    >
      <FormGrid columns="three" gap="compact">
        <InputField label="First name" placeholder="Ana" required />
        <InputField label="Last name" placeholder="Matos" required />
        <InputField label="Postal code" placeholder="00000-000" />
        <FormGridItem span="two">
          <InputField label="Street address" placeholder="Street and number" />
        </FormGridItem>
        <InputField label="City" placeholder="Sao Paulo" />
        <FormGridItem span="full">
          <TextareaField
            textareaSize="sm"
            label="Delivery notes"
            placeholder="Reception details or access instructions."
          />
        </FormGridItem>
      </FormGrid>
    </FormSection>
  );
}
