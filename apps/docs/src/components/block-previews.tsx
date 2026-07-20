"use client";

import type { ComponentType } from "react";

import { SidebarSurface01 } from "@/registry/new-york-v4/blocks/sidebar-surface-01/sidebar-surface-01";
import { SignIn01 } from "@/registry/new-york-v4/blocks/sign-in-01/sign-in-01";

export const blockComponents: Record<string, ComponentType> = {
  "sidebar-surface-01": SidebarSurface01,
  "sign-in-01": SignIn01,
};

export function getBlockComponent(id: string): ComponentType | undefined {
  return blockComponents[id];
}
