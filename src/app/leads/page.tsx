"use client"

import EntityNavBar from "@/components/EntityNavBar"
import EntityTable, { EntityColumn } from "@/components/EntityTable"
import { useLeads, useUsers, Lead } from "@/state/queries/leads"
import { useMemo } from "react"
import { useLeadsUiStore } from "@/state/stores/leadsUiStore"

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
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useLeads()
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers()
  const headerLayout = useLeadsUiStore((s) => s.headerLayout)

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(users ?? []).forEach((u) => map.set(u.id, `${u.first_name} ${u.last_name}`))
    return map
  }, [users])

  const rows: LeadRow[] = useMemo(() => {
    return (leads ?? []).map((l: Lead) => ({
      id: l.id,
      firstname: l.firstname,
      lastname: l.lastname,
      company: l.company,
      email: l.email,
      assignedTo: l.assigned_user_id ? userMap.get(l.assigned_user_id) : undefined,
      website: null,
    }))
  }, [leads, userMap])

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

  if (leadsLoading || usersLoading) {
    return (
      <div className="flex flex-col gap-3">
        <EntityNavBar />
        <div className="p-4 text-sm text-muted-foreground">Loading leads…</div>
      </div>
    )
  }

  if (leadsError || usersError) {
    return (
      <div className="flex flex-col gap-3">
        <EntityNavBar />
        <div className="p-4 text-sm text-red-600">
          {(leadsError || usersError)?.toString()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <EntityNavBar />
      <EntityTable
        title="Leads"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        headerLayout={headerLayout}
      />
    </div>
  )
}

export default Leads
