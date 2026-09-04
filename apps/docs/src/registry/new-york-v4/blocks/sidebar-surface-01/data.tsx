import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  type LucideIcon,
  Rocket,
  Settings,
  Users,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "platform",
    label: "Platform",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "projects", label: "Projects", icon: FolderKanban, badge: "12" },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "deployments", label: "Deployments", icon: Rocket, badge: "3" },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "team", label: "Team", icon: Users },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export const currentUser = {
  name: "Marina Alves",
  email: "marina@acme.com",
  initials: "MA",
};
