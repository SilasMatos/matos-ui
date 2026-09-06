"use client";

import type { ComponentType } from "react";

import { CommandMenu01 } from "@/registry/new-york-v4/blocks/command-menu-01/command-menu-01";
import { DashboardOverview01 } from "@/registry/new-york-v4/blocks/dashboard-overview-01/dashboard-overview-01";
import { NotificationCenter01 } from "@/registry/new-york-v4/blocks/notification-center-01/notification-center-01";
import { PricingTiers01 } from "@/registry/new-york-v4/blocks/pricing-tiers-01/pricing-tiers-01";
import { ProfileSettings01 } from "@/registry/new-york-v4/blocks/profile-settings-01/profile-settings-01";
import { SidebarSurface01 } from "@/registry/new-york-v4/blocks/sidebar-surface-01/sidebar-surface-01";
import { SignIn01 } from "@/registry/new-york-v4/blocks/sign-in-01/sign-in-01";
import { StatTiles01 } from "@/registry/new-york-v4/blocks/stat-tiles-01/stat-tiles-01";

export const blockComponents: Record<string, ComponentType> = {
  "command-menu-01": CommandMenu01,
  "dashboard-overview-01": DashboardOverview01,
  "notification-center-01": NotificationCenter01,
  "pricing-tiers-01": PricingTiers01,
  "profile-settings-01": ProfileSettings01,
  "sidebar-surface-01": SidebarSurface01,
  "sign-in-01": SignIn01,
  "stat-tiles-01": StatTiles01,
};

export function getBlockComponent(id: string): ComponentType | undefined {
  return blockComponents[id];
}
