"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  Hash,
  Mail,
  X,
} from "lucide-react";

import {
  DataTable,
  DataTableBadge,
  DataTableColumnHeader,
  type DataTableRowState,
} from "@/registry/new-york-v4/ui/data-table";

type Employee = {
  id: string;
  department: "Finance" | "HR" | "Marketing" | "Sales" | "Engineering";
  email: string;
  employment: "Active" | "Inactive";
  firstName: string;
  lastName: string;
  deleted?: boolean;
  subRows?: Employee[];
};

const employees: Employee[] = [
  {
    id: "#1024",
    department: "Finance",
    email: "liam.patel@globex.com",
    employment: "Active",
    firstName: "Liam",
    lastName: "Patel",
  },
  {
    id: "#1025",
    department: "HR",
    email: "priya.nakamura@globex.com",
    employment: "Active",
    firstName: "Priya",
    lastName: "Nakamura",
    subRows: [
      {
        id: "#1025",
        department: "Finance",
        email: "pnakamura@gmail.com",
        employment: "Active",
        firstName: "Priya",
        lastName: "Nakamura",
      },
    ],
  },
  {
    id: "#1026",
    department: "Marketing",
    email: "tobias.engstrom@globex.com",
    employment: "Active",
    firstName: "Tobias",
    lastName: "Engstrom",
    subRows: [
      {
        id: "#1026",
        department: "HR",
        email: "tobias@globex.com",
        employment: "Inactive",
        firstName: "Tobias",
        lastName: "Engstrom",
      },
      {
        id: "#1026",
        department: "Marketing",
        email: "t.engstrom@gmail.com",
        employment: "Active",
        firstName: "Tobias",
        lastName: "Engstrom",
      },
    ],
  },
  {
    id: "#1027",
    department: "Sales",
    email: "amara.osei@globex.com",
    employment: "Inactive",
    firstName: "Amara",
    lastName: "Osei",
    deleted: true,
  },
  {
    id: "#1028",
    department: "Sales",
    email: "carlos.medina@globex.com",
    employment: "Active",
    firstName: "Carlos",
    lastName: "Medina",
  },
  {
    id: "#1029",
    department: "Engineering",
    email: "mei.zhang@globex.com",
    employment: "Active",
    firstName: "Mei",
    lastName: "Zhang",
  },
  {
    id: "#1030",
    department: "Engineering",
    email: "felix.andersson@globex.com",
    employment: "Inactive",
    firstName: "Felix",
    lastName: "Andersson",
    deleted: true,
  },
  {
    id: "#1031",
    department: "HR",
    email: "sofia.reyes@globex.com",
    employment: "Active",
    firstName: "Sofia",
    lastName: "Reyes",
    subRows: [
      {
        id: "#1031",
        department: "Engineering",
        email: "sreyes@gmail.com",
        employment: "Active",
        firstName: "Sofia",
        lastName: "Reyes",
      },
    ],
  },
  {
    id: "#1032",
    department: "Finance",
    email: "idris.kouassi@globex.com",
    employment: "Active",
    firstName: "Idris",
    lastName: "Kouassi",
  },
  {
    id: "#1033",
    department: "Finance",
    email: "hana.watanabe@globex.com",
    employment: "Active",
    firstName: "Hana",
    lastName: "Watanabe",
  },
  {
    id: "#1034",
    department: "Marketing",
    email: "nora.klein@globex.com",
    employment: "Inactive",
    firstName: "Nora",
    lastName: "Klein",
  },
  {
    id: "#1035",
    department: "Engineering",
    email: "owen.clark@globex.com",
    employment: "Active",
    firstName: "Owen",
    lastName: "Clark",
  },
];

const departmentTone: Record<
  Employee["department"],
  React.ComponentProps<typeof DataTableBadge>["tone"]
> = {
  Finance: "finance",
  HR: "hr",
  Marketing: "marketing",
  Sales: "sales",
  Engineering: "engineering",
};

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        icon={<Hash aria-hidden="true" />}
      />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground tabular-nums">
        {row.getValue("id")}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Department"
        icon={<Building2 aria-hidden="true" />}
      />
    ),
    cell: ({ row }) => {
      const department = row.getValue<Employee["department"]>("department");

      return (
        <DataTableBadge tone={departmentTone[department]}>
          {department}
        </DataTableBadge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Email"
        icon={<Mail aria-hidden="true" />}
      />
    ),
    cell: ({ row }) => (
      <span className="block truncate text-muted-foreground">
        {row.getValue("email")}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "employment",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Employment"
        icon={<BriefcaseBusiness aria-hidden="true" />}
      />
    ),
    cell: ({ row }) => {
      const employment = row.getValue<Employee["employment"]>("employment");
      const StatusIcon = employment === "Active" ? Check : X;

      return (
        <DataTableBadge
          tone={employment === "Active" ? "active" : "inactive"}
          dot={false}
          className="gap-1.5 px-2.5"
        >
          <StatusIcon className="size-3.5" aria-hidden="true" />
          {employment}
        </DataTableBadge>
      );
    },
    enableSorting: true,
  },
];

function getEmployeeRowState(employee: Employee): DataTableRowState {
  if (employee.deleted) {
    return "deleted";
  }

  if (employee.employment === "Inactive") {
    return "inactive";
  }

  return "default";
}

export default function DataTableDemo() {
  return (
    <DataTable
      data={employees}
      columns={columns}
      pageSize={8}
      getRowState={getEmployeeRowState}
    />
  );
}
