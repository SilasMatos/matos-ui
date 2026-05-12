"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  DataTable,
  type DataTableAvatarItem,
  DataTableAvatarStack,
  DataTableColumnHeader,
  DataTableConfidence,
  DataTableStatusBadge,
  DataTableTaskCount,
} from "@/registry/new-york-v4/ui/data-table";

type AgentStatus = "running" | "idle" | "error" | "scheduled";

type Agent = {
  agent: string;
  status: AgentStatus;
  confidence: number;
  cost: string;
  tasks: number;
  assignee: DataTableAvatarItem[];
};

const agents: Agent[] = [
  {
    agent: "Researcher",
    status: "running",
    confidence: 94,
    cost: "$0.034",
    tasks: 12,
    assignee: [
      {
        name: "Ana Silva",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
      },
    ],
  },
  {
    agent: "Proposal Drafter",
    status: "idle",
    confidence: 87,
    cost: "$0.018",
    tasks: 3,
    assignee: [
      {
        name: "Marina Costa",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
      },
      {
        name: "Lucas Rocha",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
      },
      { name: "João Lima", initials: "JL" },
      { name: "Bia Torres", initials: "BT" },
      { name: "Rafa Alves", initials: "RA" },
    ],
  },
  {
    agent: "Data Extractor",
    status: "error",
    confidence: 61,
    cost: "$0.052",
    tasks: 2,
    assignee: [{ name: "Agent Group", initials: "AG" }],
  },
  {
    agent: "UX Reviewer",
    status: "running",
    confidence: 91,
    cost: "$0.027",
    tasks: 7,
    assignee: [
      {
        name: "Pedro Martins",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
      },
      {
        name: "Mateus Dias",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      },
      {
        name: "Carlos Freitas",
        image:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&crop=face",
      },
    ],
  },
  {
    agent: "Composer",
    status: "running",
    confidence: 88,
    cost: "$0.011",
    tasks: 5,
    assignee: [
      {
        name: "Laura Mendes",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      },
      {
        name: "Felipe Souza",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      },
      { name: "Nina Reis", initials: "NR" },
      { name: "Theo Ramos", initials: "TR" },
    ],
  },
  {
    agent: "Code Reviewer",
    status: "scheduled",
    confidence: 96,
    cost: "$0.041",
    tasks: 21,
    assignee: [
      {
        name: "Bruno Lopes",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
      },
      {
        name: "Gustavo Lima",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
      },
      {
        name: "Diego Nunes",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      },
      { name: "Sofia Dias", initials: "SD" },
      { name: "Luan Castro", initials: "LC" },
      { name: "Eva Moraes", initials: "EM" },
    ],
  },
];

const statusLabel: Record<AgentStatus, string> = {
  running: "Running",
  idle: "Idle",
  error: "Error",
  scheduled: "Scheduled",
};

const columns: ColumnDef<Agent>[] = [
  {
    accessorKey: "agent",
    size: 190,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.agent}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    size: 140,
    header: "Status",
    cell: ({ row }) => (
      <DataTableStatusBadge status={row.original.status}>
        {statusLabel[row.original.status]}
      </DataTableStatusBadge>
    ),
  },
  {
    accessorKey: "confidence",
    size: 170,
    header: "Confidence",
    cell: ({ row }) => (
      <DataTableConfidence
        value={row.original.confidence}
        showPercent={row.original.confidence > 70}
      />
    ),
  },
  {
    accessorKey: "cost",
    size: 110,
    header: "Cost",
    cell: ({ row }) => (
      <span className="font-medium text-foreground/85">
        {row.original.cost}
      </span>
    ),
  },
  {
    accessorKey: "tasks",
    size: 100,
    header: "Tasks",
    cell: ({ row }) => <DataTableTaskCount count={row.original.tasks} />,
  },
  {
    accessorKey: "assignee",
    size: 150,
    header: "Assignee",
    cell: ({ row }) => <DataTableAvatarStack users={row.original.assignee} />,
  },
];

export default function DataTableDemo() {
  return (
    <div className="w-full max-w-4xl">
      <DataTable data={agents} columns={columns} pageSize={6} totalItems={35} />
    </div>
  );
}
