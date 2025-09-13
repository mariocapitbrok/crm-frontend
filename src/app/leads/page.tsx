"use client"

import EntityNavBar from "@/components/EntityNavBar"
import EntityTable, { EntityColumn } from "@/components/EntityTable"
import db from "../../../db.json"

type LeadRow = {
  id: number
  firstname: string
  lastname: string
  company: string
  email: string
  assignedTo?: string
  website?: string | null
}

const Leads = () => {
  const users = new Map(
    (db.users ?? []).map((u: any) => [u.id, `${u.first_name} ${u.last_name}`])
  )

  const rows: LeadRow[] = (db.leads ?? []).map((l: any) => ({
    id: l.id,
    firstname: l.firstname,
    lastname: l.lastname,
    company: l.company,
    email: l.email,
    assignedTo: users.get(l.assigned_user_id),
    website: null,
  }))

  const columns: EntityColumn<LeadRow>[] = [
    {
      id: "firstname",
      header: "First Name",
      accessor: (r) => r.firstname,
      sortAccessor: (r) => r.firstname,
      filter: { type: "text", placeholder: "First name" },
      width: 180,
    },
    {
      id: "lastname",
      header: "Last Name",
      accessor: (r) => r.lastname,
      sortAccessor: (r) => r.lastname,
      filter: { type: "text", placeholder: "Last name" },
      width: 180,
    },
    {
      id: "company",
      header: "Company",
      accessor: (r) => r.company,
      sortAccessor: (r) => r.company,
      filter: { type: "text", placeholder: "Company" },
      width: 280,
    },
    {
      id: "website",
      header: "Website",
      accessor: (r) =>
        r.website ? (
          <a className="text-blue-600 hover:underline" href={r.website} target="_blank" rel="noreferrer">
            {r.website}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortAccessor: (r) => r.website ?? "",
      filter: { type: "text", placeholder: "Website" },
      width: 260,
    },
    {
      id: "email",
      header: "Primary Email",
      accessor: (r) => (
        <a className="hover:underline" href={`mailto:${r.email}`}>
          {r.email}
        </a>
      ),
      sortAccessor: (r) => r.email,
      filter: { type: "text", placeholder: "Email" },
      width: 280,
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessor: (r) => r.assignedTo ?? "",
      sortAccessor: (r) => r.assignedTo ?? "",
      filter: { type: "text", placeholder: "Owner" },
      width: 220,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <EntityNavBar />
      <EntityTable
        title="Leads"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
      />
    </div>
  )
}

export default Leads
