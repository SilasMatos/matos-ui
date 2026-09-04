"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Github } from "lucide-react";
import { type FormEvent, type SVGProps, useId, useState } from "react";

import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { CheckboxField } from "@/registry/new-york-v4/ui/checkbox";
import { InputField } from "@/registry/new-york-v4/ui/input";
import { PasswordInput } from "@/registry/new-york-v4/ui/password-input";
import { AuthAside } from "./components/auth-aside";

type Status = "idle" | "loading" | "error" | "success";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.96h5.28c-.23 1.4-1.65 4.1-5.28 4.1-3.18 0-5.78-2.63-5.78-5.86s2.6-5.86 5.78-5.86c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.9 3.55 14.76 2.6 12.18 2.6 6.99 2.6 2.82 6.77 2.82 12s4.17 9.4 9.36 9.4c5.4 0 8.98-3.8 8.98-9.15 0-.61-.07-1.08-.16-1.55z"
      />
    </svg>
  );
}

export function SignIn01() {
  const shouldReduceMotion = useReducedMotion();
  const formId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const isLoading = status === "loading";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmailError = !email.trim()
      ? "Enter your email address."
      : !EMAIL_PATTERN.test(email.trim())
        ? "Enter a valid email address."
        : null;
    const nextPasswordError = !password
      ? "Enter your password."
      : password.length < 8
        ? "Password must be at least 8 characters."
        : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setStatus("loading");

    // Simulated auth request — no real network call.
    window.setTimeout(() => {
      if (email.trim().toLowerCase().startsWith("error@")) {
        setStatus("error");
        setFormError("Invalid email or password. Please try again.");
        return;
      }

      setStatus("success");
    }, 1200);
  }

  function resetForm() {
    setStatus("idle");
    setFormError(null);
    setEmail("");
    setPassword("");
    setEmailError(null);
    setPasswordError(null);
  }

  return (
    <div
      data-slot="sign-in-01"
      className="@container/signin w-full text-foreground"
    >
      <div className="mx-auto grid w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-sm @2xl/signin:max-w-3xl @2xl/signin:grid-cols-2">
        <AuthAside />

        <div className="p-6 @xl/signin:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (
              <motion.div
                key="success"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[22rem] flex-col items-center justify-center text-center"
                role="status"
                aria-live="polite"
              >
                <span className="grid size-12 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  You're signed in
                </h2>
                <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                  Welcome back. Redirecting you to your dashboard…
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6"
                  onClick={resetForm}
                >
                  Back to sign in
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6">
                  <Badge variant="soft" size="sm" className="mb-3">
                    Sign in
                  </Badge>
                  <h1 className="text-xl font-semibold tracking-tight">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your credentials to access your account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 @sm/signin:grid-cols-2">
                  <Button variant="outline" className="w-full" type="button">
                    <Github aria-hidden="true" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="w-full" type="button">
                    <GoogleIcon className="size-4" />
                    Google
                  </Button>
                </div>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">
                    or continue with email
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <AnimatePresence initial={false}>
                  {formError ? (
                    <motion.div
                      initial={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -4 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -4 }
                      }
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      role="alert"
                      aria-live="assertive"
                      className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{formError}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <InputField
                    id={`${formId}-email`}
                    type="email"
                    label="Email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    error={emailError ?? undefined}
                    disabled={isLoading}
                  />

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        Password
                      </span>
                      <a
                        href="#reset"
                        className="rounded text-xs font-medium text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <PasswordInput
                      id={`${formId}-password`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      showCriteria={false}
                      required
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      error={passwordError ?? undefined}
                      disabled={isLoading}
                    />
                  </div>

                  <CheckboxField
                    id={`${formId}-remember`}
                    name="remember"
                    label="Remember me for 30 days"
                    defaultChecked
                    reserveMessageSpace={false}
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isLoading}
                    loadingText="Signing in…"
                  >
                    Sign in
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a
                    href="#signup"
                    className="rounded font-medium text-foreground underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Create one
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
