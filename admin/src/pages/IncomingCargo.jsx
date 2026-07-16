import { AlertCircle, Clock, Package, PackagePlus } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'

const shipments = [
  { id: 'INC-001', company: 'Acme Logistics Inc.', from: 'Los Angeles, CA', item: 'Machine Parts XYZ-7', quantity: '245 units', weight: '1,240 kg', progress: 65, status: 'In Transit', date: 'Oct 28, 2023', tone: 'yellow' },
  { id: 'INC-002', company: 'Global Exports Ltd.', from: 'New York, NY', item: 'Electronic Components', quantity: '128 units', weight: '320 kg', progress: 85, status: 'Arriving Soon', date: 'Oct 26, 2023', tone: 'blue' },
]

export default function IncomingCargo() {
  return (
    <>
      <PageHeader title="Incoming Cargo" subtitle="Track and manage incoming shipments to warehouse" />
      <section className="stats-grid compact">
        <StatCard icon={PackagePlus} label="Total Incoming" value="8" />
        <StatCard icon={Package} label="In Transit" value="5" tone="yellow" />
        <StatCard icon={Clock} label="Arriving Soon" value="1" />
        <StatCard icon={AlertCircle} label="Delayed" value="1" tone="red" />
      </section>
      <SearchBar placeholder="Search by sender, ID, or items..." />
      <section className="shipment-list">
        {shipments.map((shipment) => (
          <article className="shipment-card" key={shipment.id}>
            <div className={`shipment-mark ${shipment.tone}`}><PackagePlus /></div>
            <div className="shipment-body">
              <div className="shipment-head">
                <div><h2><a>{shipment.id}</a> <StatusBadge>{shipment.status}</StatusBadge></h2><strong>{shipment.company}</strong><p>From: {shipment.from}</p></div>
                <div className="arrival"><span>Expected Arrival</span><strong>{shipment.date}</strong></div>
              </div>
              <div className="shipment-meta">
                <div><span>Items</span><strong>{shipment.item}</strong></div>
                <div><span>Quantity</span><strong>{shipment.quantity}</strong></div>
                <div><span>Weight</span><strong>{shipment.weight}</strong></div>
                <div><span>Progress</span><strong>{shipment.progress}%</strong></div>
              </div>
              <div className="progress"><span className={shipment.tone} style={{ width: `${shipment.progress}%` }} /></div>
              <div className="shipment-actions"><button>View Details</button><button className="button primary">Update Status</button></div>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
