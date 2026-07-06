import { CircleCheck, Grid3X3, Package, PieChart } from 'lucide-react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { storageRows } from '../data/adminData'

const zones = [
  ['A', '24', '856/1000', 86, 'warn'], ['B', '20', '512/850', 60, 'good'],
  ['C', '18', '698/750', 93, 'warn'], ['D', '16', '245/680', 36, 'good'],
  ['E', '22', '892/920', 97, 'danger'], ['F', '15', '124/640', 19, 'good'],
]

export default function StorageAllocation() {
  const renderCell = (cell, index, row) => {
    if (index === 0) return <a>{cell}</a>
    if (index === 1) return <span className="zone-badge">{cell}</span>
    if (index === 5) return <span className="utilization"><i><b style={{ width: cell }} /></i>{cell}</span>
    if (index === 6) return <StatusBadge>{cell}</StatusBadge>
    return cell
  }

  return (
    <>
      <PageHeader title="Storage Allocation" subtitle="Manage warehouse storage space and allocation" />
      <section className="stats-grid compact">
        <StatCard icon={Grid3X3} label="Total Capacity" value="4840" suffix="units" />
        <StatCard icon={Package} label="Occupied" value="3327" suffix="units" tone="yellow" />
        <StatCard icon={CircleCheck} label="Available" value="1513" suffix="units" tone="green" />
        <StatCard icon={PieChart} label="Occupancy Rate" value="68.7%" tone="purple" />
      </section>
      <article className="panel zones-panel">
        <h2>Storage Zones Overview</h2>
        <div className="zones">
          {zones.map(([zone, sections, amount, percent, state]) => (
            <div className={`zone ${state}`} key={zone}>
              <strong>{zone}</strong><span>{sections}<br />sections</span>
              <div className="progress"><i style={{ width: `${percent}%` }} /></div>
              <b>{amount}</b><small>{percent}% full</small>
            </div>
          ))}
        </div>
      </article>
      <SearchBar placeholder="Search sections by ID or items..." />
      <DataTable columns={['Section ID', 'Zone', 'Location', 'Current Items', 'Capacity', 'Utilization', 'Status']} rows={storageRows} renderCell={renderCell} />
    </>
  )
}
