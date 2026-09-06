"use client";

import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return null;
}

/** Framer Motion 12 snapshots the preference on mount. Subscribe as well so
 *  changing the OS setting updates mounted Arena components without a reload. */
export function useArenaReducedMotion() {
  const initialPreference = useReducedMotion();
  const livePreference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return livePreference ?? initialPreference ?? false;
}
