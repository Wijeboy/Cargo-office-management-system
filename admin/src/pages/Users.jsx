import { Shield, UserCheck, UserRound, UserX } from 'lucide-react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { userRows } from '../data/adminData'

export default function Users() {
  const renderCell = (cell, index, row) => {
    if (index === 0) return <a>{cell}</a>
    if (index === 1) return <span className="avatar">{cell}</span>
    if (index === 4) return <span className={`role role-${cell.toLowerCase().split(' ')[0]}`}>{cell}</span>
    if (index === 6) return <StatusBadge>{cell}</StatusBadge>
    return cell
  }

  return (
    <>
      <PageHeader title="User Management" subtitle="Manage user accounts, roles, and permissions" />
      <section className="stats-grid compact">
        <StatCard icon={UserRound} label="Total Users" value="8" />
        <StatCard icon={UserCheck} label="Active Users" value="6" tone="green" />
        <StatCard icon={UserX} label="Inactive Users" value="1" tone="gray" />
        <StatCard icon={Shield} label="Suspended" value="1" tone="red" />
      </section>
      <SearchBar placeholder="Search by name, email, or user ID..." action="Add User" />
      <DataTable
        columns={['User ID', '', 'Name', 'Email', 'Role', 'Department', 'Status', 'Last Active']}
        rows={userRows}
        renderCell={renderCell}
      />
    </>
  )
}
