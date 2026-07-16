import { CheckCircle, Package, PackageCheck, Truck } from 'lucide-react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { outgoingRows } from '../data/adminData'

export default function OutgoingCargo() {
  const renderCell = (cell, index) => {
    if (index === 0 || index === 7) return <a>{cell}</a>
    if (index === 6) return <StatusBadge>{cell}</StatusBadge>
    return cell
  }

  return (
    <>
      <PageHeader title="Outgoing Cargo" subtitle="Manage and track outgoing shipments from warehouse" />
      <section className="stats-grid compact">
        <StatCard icon={Truck} label="Total Outgoing" value="8" />
        <StatCard icon={Package} label="Processing" value="1" tone="orange" />
        <StatCard icon={PackageCheck} label="In Transit" value="4" />
        <StatCard icon={CheckCircle} label="Delivered" value="1" tone="green" />
      </section>
      <SearchBar placeholder="Search by consignee, ID, or tracking number..." />
      <DataTable
        columns={['Shipment ID', 'Consignee', 'Destination', 'Items', 'Weight', 'Ship Date', 'Status', 'Tracking ID']}
        rows={outgoingRows}
        renderCell={renderCell}
      />
    </>
  )
}
