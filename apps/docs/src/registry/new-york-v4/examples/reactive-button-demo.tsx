"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  ReactiveButton,
  type ReactiveButtonStatus,
} from "@/registry/new-york-v4/ui/reactive-button";

function useDemoAction(
  result: Extract<ReactiveButtonStatus, "success" | "error">,
) {
  const [status, setStatus] = useState<ReactiveButtonStatus>("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  function run() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setStatus("loading");
    timerRef.current = window.setTimeout(() => {
      setStatus(result);
    }, 1100);
  }

  return { status, setStatus, run };
}

function useDeletionCountdown(initialValue = 9) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) =>
        current === null || current <= 1 ? null : current - 1,
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  function toggle() {
    setCountdown((current) => (current === null ? initialValue : null));
  }

  return { countdown, toggle };
}

export default function ReactiveButtonDemo() {
  const send = useDemoAction("success");
  const save = useDemoAction("success");
  const remove = useDemoAction("error");
  const deletion = useDeletionCountdown();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <ReactiveButton
          status={send.status}
          loadingText="Sending..."
          successText="Sent"
          icon={<Send />}
          autoReset
          onStatusReset={() => send.setStatus("idle")}
          onClick={send.run}
        >
          Send message
        </ReactiveButton>
        <ReactiveButton
          variant="secondary"
          status={save.status}
          loadingText="Saving..."
          successText="Saved"
          autoReset
          onStatusReset={() => save.setStatus("idle")}
          onClick={save.run}
        >
          Save changes
        </ReactiveButton>
        <ReactiveButton
          variant="destructive"
          status={remove.status}
          loadingText="Deleting..."
          errorText="Failed"
          autoReset
          resetDelay={2200}
          onStatusReset={() => remove.setStatus("idle")}
          onClick={remove.run}
        >
          Delete item
        </ReactiveButton>
        <ReactiveButton
          variant="destructive"
          countdown={deletion.countdown ?? undefined}
          onClick={deletion.toggle}
        >
          {deletion.countdown === null
            ? "Schedule deletion"
            : "Cancel deletion"}
        </ReactiveButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-border/60 border-t pt-4">
        <ReactiveButton size="sm">Default</ReactiveButton>
        <ReactiveButton size="sm" variant="secondary">
          Secondary
        </ReactiveButton>
        <ReactiveButton size="sm" variant="outline">
          Outline
        </ReactiveButton>
        <ReactiveButton size="sm" variant="ghost">
          Ghost
        </ReactiveButton>
        <ReactiveButton size="sm" variant="destructive">
          Destructive
        </ReactiveButton>
      </div>
    </div>
  );
}
