"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/registry/new-york-v4/ui/button";
import { FormGrid } from "@/registry/new-york-v4/ui/form-grid";
import { FormSection } from "@/registry/new-york-v4/ui/form-section";
import { InputField } from "@/registry/new-york-v4/ui/input";
import { Select } from "@/registry/new-york-v4/ui/select";

const workspaceSchema = z.object({
  email: z.email("Enter a valid work email."),
  teamSize: z.string().min(1, "Choose a team size."),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export default function FormWithZodDemo() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { email: "", teamSize: "" },
    mode: "onBlur",
  });

  async function onSubmit() {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-xl"
      noValidate
    >
      <FormSection
        size="compact"
        title="Request access"
        description="Zod errors are passed directly to each form component."
        footer={
          <>
            <span className="text-xs text-muted-foreground">
              {isSubmitSuccessful
                ? "Request ready for review."
                : "No card required."}
            </span>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              loadingText="Sending..."
            >
              Continue
            </Button>
          </>
        }
      >
        <FormGrid gap="compact">
          <InputField
            label="Work email"
            placeholder="you@company.com"
            required
            error={errors.email?.message}
            {...register("email")}
          />
          <Controller
            name="teamSize"
            control={control}
            render={({ field }) => (
              <Select
                label="Team size"
                required
                options={[
                  { value: "small", label: "1-10 people" },
                  { value: "medium", label: "11-50 people" },
                  { value: "large", label: "51+ people" },
                ]}
                value={field.value || null}
                onValueChange={(nextValue) => field.onChange(nextValue ?? "")}
                name={field.name}
                inputRef={field.ref}
                error={errors.teamSize?.message}
                placeholder="Choose size"
              />
            )}
          />
        </FormGrid>
      </FormSection>
    </form>
  );
}
