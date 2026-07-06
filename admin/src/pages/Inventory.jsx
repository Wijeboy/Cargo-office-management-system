import { Boxes, PackageCheck, PackageX, Plus, TriangleAlert } from 'lucide-react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { inventoryRows } from '../data/adminData'

export default function Inventory() {
  const renderCell = (cell, index) => {
    if (index === 0) return <a>{cell}</a>
    if (index === 2) return <span className="category-badge">{cell}</span>
    if (index === 6) return <StatusBadge>{cell}</StatusBadge>
    return cell
  }

  return (
    <>
      <PageHeader title="Inventory Management" subtitle="Track and manage warehouse inventory items" />
      <SearchBar placeholder="Search inventory by name or ID..." action="Add Item" exportButton />
      <section className="stats-grid compact">
        <StatCard icon={Boxes} label="Total Items" value="920" />
        <StatCard icon={PackageCheck} label="In Stock" value="886" tone="green" />
        <StatCard icon={TriangleAlert} label="Low Stock" value="28" tone="yellow" />
        <StatCard icon={PackageX} label="Out of Stock" value="6" tone="red" />
      </section>
      <DataTable
        columns={['Item ID ↕', 'Item Name ↕', 'Category', 'Quantity ↕', 'Location', 'Weight', 'Status', 'Last Updated']}
        rows={inventoryRows}
        renderCell={renderCell}
      />
    </>
  )
}
