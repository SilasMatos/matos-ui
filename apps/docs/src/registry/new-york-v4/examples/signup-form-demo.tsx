"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/registry/new-york-v4/ui/button";
import { CheckboxField } from "@/registry/new-york-v4/ui/checkbox";
import { FormGrid, FormGridItem } from "@/registry/new-york-v4/ui/form-grid";
import { FormSection } from "@/registry/new-york-v4/ui/form-section";
import { InputField } from "@/registry/new-york-v4/ui/input";
import { PasswordInput } from "@/registry/new-york-v4/ui/password-input";
import { Select } from "@/registry/new-york-v4/ui/select";
import { TextareaField } from "@/registry/new-york-v4/ui/textarea";

const signupSchema = z
  .object({
    firstName: z.string().trim().min(2, "Enter your first name."),
    lastName: z.string().trim().min(2, "Enter your last name."),
    email: z.email("Enter a valid email address."),
    phone: z.string().trim().min(10, "Enter a valid phone number."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Z]/, "Include one uppercase letter.")
      .regex(/[a-z]/, "Include one lowercase letter.")
      .regex(/\d/, "Include one number.")
      .regex(/[^A-Za-z0-9]/, "Include one special character."),
    confirmPassword: z.string(),
    role: z.string().min(1, "Select an area of interest."),
    note: z.string().max(220, "Use up to 220 characters.").optional(),
    terms: z.boolean().refine((value) => value, {
      message: "Accept the terms to continue.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

const roleOptions = [
  {
    value: "design",
    label: "Design",
    description: "Systems, interaction and visual craft.",
  },
  {
    value: "engineering",
    label: "Engineering",
    description: "Product interfaces and implementation.",
  },
  {
    value: "product",
    label: "Product",
    description: "Discovery, delivery and strategy.",
  },
];

export default function SignupFormDemo() {
  const {
    control,
    register,
    handleSubmit,
    formState: { dirtyFields, errors, isSubmitting, isSubmitSuccessful },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
      note: "",
      terms: false,
    },
    mode: "onBlur",
  });

  async function onSubmit() {
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-3xl"
      noValidate
    >
      <FormSection
        title="Create your account"
        description="A focused onboarding form with secure validation and compact inset surfaces."
        footer={
          <>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {isSubmitSuccessful
                ? "Account details validated successfully."
                : "Your information is securely reviewed before submission."}
            </p>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Creating account..."
            >
              Create account
            </Button>
          </>
        }
      >
        <FormGrid gap="compact">
          <InputField
            label="First name"
            placeholder="Sofia"
            required
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <InputField
            label="Last name"
            placeholder="Matos"
            required
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <InputField
            type="email"
            label="Email"
            placeholder="sofia@company.com"
            required
            state={dirtyFields.email && !errors.email ? "success" : "default"}
            error={errors.email?.message}
            {...register("email")}
          />
          <InputField
            type="tel"
            label="Phone"
            placeholder="+55 11 99999-9999"
            required
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label="Password"
                required
                value={field.value}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                ref={field.ref}
                error={errors.password?.message}
                placeholder="Create a password"
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label="Confirm password"
                required
                value={field.value}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                ref={field.ref}
                error={errors.confirmPassword?.message}
                placeholder="Repeat your password"
                showCriteria={false}
              />
            )}
          />
          <FormGridItem span="full">
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  label="Role or interest"
                  required
                  options={roleOptions}
                  value={field.value || null}
                  onValueChange={(nextValue) => field.onChange(nextValue ?? "")}
                  name={field.name}
                  inputRef={field.ref}
                  error={errors.role?.message}
                  placeholder="Choose an area"
                />
              )}
            />
          </FormGridItem>
          <FormGridItem span="full">
            <TextareaField
              label="Additional notes"
              description="Optional. Tell us what you want to build."
              placeholder="A short note about your next product..."
              error={errors.note?.message}
              {...register("note")}
            />
          </FormGridItem>
          <FormGridItem span="full">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <CheckboxField
                  label="I agree to the workspace terms"
                  description="Required before creating an account."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  name={field.name}
                  inputRef={field.ref}
                  error={errors.terms?.message}
                  required
                />
              )}
            />
          </FormGridItem>
        </FormGrid>
      </FormSection>
    </form>
  );
}
