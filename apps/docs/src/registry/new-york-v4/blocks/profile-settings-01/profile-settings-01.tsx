"use client";

import {
  Bell,
  Camera,
  CheckCircle2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { InputField } from "@/registry/new-york-v4/ui/input";
import { TextareaField } from "@/registry/new-york-v4/ui/textarea";

type SaveStatus = "idle" | "saving" | "saved";

const navigation = [
  { id: "profile", label: "Profile", icon: UserRound, active: true },
  { id: "notifications", label: "Notifications", icon: Bell, active: false },
  { id: "security", label: "Security", icon: LockKeyhole, active: false },
] as const;

export function ProfileSettings01() {
  const formId = useId();
  const [name, setName] = useState("Marina Costa");
  const [email, setEmail] = useState("marina@acme.com");
  const [role, setRole] = useState("Product designer");
  const [bio, setBio] = useState(
    "Designing calm, thoughtful tools for ambitious teams.",
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.includes("@")) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError(null);
    setStatus("saving");

    window.setTimeout(() => {
      setStatus("saved");
    }, 900);
  }

  function markDirty() {
    if (status === "saved") {
      setStatus("idle");
    }
  }

  const isSaving = status === "saving";

  return (
    <div
      data-slot="profile-settings-01"
      className="@container/settings w-full overflow-hidden rounded-2xl border border-border bg-background text-foreground"
    >
      <div className="mx-auto min-h-[34rem] w-full max-w-5xl p-4 @2xl/settings:p-6">
        <header className="border-border border-b pb-5">
          <Badge variant="soft" size="sm">
            Workspace
          </Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Account settings
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your public profile and account preferences.
          </p>
        </header>

        <div className="grid gap-6 pt-5 @3xl/settings:grid-cols-[12rem_minmax(0,1fr)] @3xl/settings:gap-8">
          <nav
            aria-label="Account settings"
            className="flex gap-1 overflow-x-auto @3xl/settings:flex-col"
          >
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={item.active ? "page" : undefined}
                className={[
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  item.active
                    ? "border border-border bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </nav>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="border-border border-b p-4 @2xl/settings:p-5">
              <h2 className="text-base font-semibold">Profile details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This information appears on your workspace profile.
              </p>
            </div>

            <div className="space-y-5 p-4 @2xl/settings:p-5">
              <section
                aria-labelledby={`${formId}-photo-heading`}
                className="flex flex-col gap-4 @sm/settings:flex-row @sm/settings:items-center"
              >
                <div className="relative w-fit">
                  <span
                    aria-hidden="true"
                    className="grid size-16 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground"
                  >
                    MC
                  </span>
                  <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                    <CheckCircle2 className="size-3.5" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    id={`${formId}-photo-heading`}
                    className="text-sm font-medium"
                  >
                    Profile photo
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    JPG, PNG or WebP. Maximum file size is 2 MB.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full @sm/settings:h-9 @sm/settings:w-auto"
                >
                  <Camera aria-hidden="true" />
                  Change photo
                </Button>
              </section>

              <div className="grid gap-4 @xl/settings:grid-cols-2">
                <InputField
                  id={`${formId}-name`}
                  label="Full name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    markDirty();
                  }}
                  reserveMessageSpace={false}
                  disabled={isSaving}
                />
                <InputField
                  id={`${formId}-role`}
                  label="Role"
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value);
                    markDirty();
                  }}
                  reserveMessageSpace={false}
                  disabled={isSaving}
                />
              </div>

              <InputField
                id={`${formId}-email`}
                type="email"
                label="Email address"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError(null);
                  markDirty();
                }}
                error={emailError ?? undefined}
                trailing={<Mail className="size-4" />}
                reserveMessageSpace={Boolean(emailError)}
                disabled={isSaving}
              />

              <TextareaField
                id={`${formId}-bio`}
                label="Bio"
                value={bio}
                maxLength={160}
                onChange={(event) => {
                  setBio(event.target.value);
                  markDirty();
                }}
                description={`${bio.length}/160 characters`}
                reserveMessageSpace={false}
                disabled={isSaving}
              />
            </div>

            <footer className="flex flex-col gap-3 border-border border-t bg-muted/35 p-4 @sm/settings:flex-row @sm/settings:items-center @sm/settings:justify-between @2xl/settings:px-5">
              <output
                aria-live="polite"
                className="min-h-5 text-xs text-muted-foreground"
              >
                {status === "saved"
                  ? "Your profile changes have been saved."
                  : "Changes are visible to workspace members."}
              </output>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 flex-1 @sm/settings:h-9 @sm/settings:flex-none"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 flex-1 @sm/settings:h-9 @sm/settings:flex-none"
                  loading={isSaving}
                  loadingText="Saving…"
                >
                  Save changes
                </Button>
              </div>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
