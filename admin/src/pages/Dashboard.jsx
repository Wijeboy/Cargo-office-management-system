import { useEffect, useState } from 'react'
import { AlertCircle, Package, Truck, UsersRound } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { warehouseApi } from '../services/warehouseApi'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    stats: { totalShipments: 0, activeUsers: 0, pendingDeliveries: 0, openIncidents: 0 },
    shipmentVolume: [],
    systemHealth: { efficiency: 0, deliveredPercent: 0, inTransitPercent: 0, delayedPercent: 0 },
    recentShipments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const data = await warehouseApi.dashboard()
        if (!ignore) setDashboard(data.dashboard)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadDashboard()
    return () => {
      ignore = true
    }
  }, [])

  const maxVolume = Math.max(...dashboard.shipmentVolume.map((day) => day.count), 1)

  return (
    <>
      <PageHeader title="Warehouse Dashboard Overview" subtitle="Real-time intelligence and fleet logistics monitoring" />
      {error && <p className="error-text">{error}</p>}
      <section className="stats-grid">
        <StatCard icon={Truck} label="Total Shipments" value={dashboard.stats.totalShipments} trend="Live" />
        <StatCard icon={Package} label="Storage Occupancy" value={`${dashboard.stats.storageOccupancyRate || 0}%`} trend="Live" tone="red" />
        <StatCard icon={UsersRound} label="Active Users" value={dashboard.stats.activeUsers} trend="Live" tone="green" />
        <StatCard icon={AlertCircle} label="Pending Deliveries" value={dashboard.stats.pendingDeliveries} trend={`${dashboard.stats.openIncidents} incidents`} tone="orange" />
      </section>

      <section className="dashboard-charts">
        <article className="panel chart-panel">
          <div className="panel-title">
            <div><h2>Shipment Volume</h2><p>Last 7 Days Performance</p></div>
            <span className="select-placeholder" />
          </div>
          <div className="bar-chart">
            <div className="axis-labels"><span>600</span><span>450</span><span>300</span><span>150</span><span>0</span></div>
            <div className="bars">
              {dashboard.shipmentVolume.map((item) => (
                <div className="bar-column" key={item.day}>
                  <span className="bar" style={{ height: `${Math.max((item.count / maxVolume) * 240, item.count ? 28 : 4)}px` }} />
                  <small>{item.day}</small>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel health-panel">
          <div className="panel-title"><div><h2>System Health</h2><p>Real-time delivery status tracking</p></div></div>
          <div className="donut"><div><strong>{dashboard.systemHealth.efficiency}%</strong><span>Efficiency</span></div></div>
          <ul className="legend">
            <li><i className="green" /> Delivered <b>{dashboard.systemHealth.deliveredPercent}%</b></li>
            <li><i className="blue" /> In Transit <b>{dashboard.systemHealth.inTransitPercent}%</b></li>
            <li><i className="red" /> Delayed <b>{dashboard.systemHealth.delayedPercent}%</b></li>
          </ul>
        </article>
      </section>

      <article className="panel recent-panel">
        <div className="panel-title bordered"><h2>Recent Shipments</h2><a>View All ›</a></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Destination</th><th>Status</th><th>Arrival</th><th>Action</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="6">Loading dashboard...</td></tr>}
              {!loading && dashboard.recentShipments.map((shipment) => (
                <tr key={shipment.orderId}>
                  <td><a>{shipment.orderId}</a></td>
                  <td><span className="person"><i className="avatar">{shipment.customerInitials}</i>{shipment.customer}</span></td>
                  <td>{shipment.destination}</td><td><StatusBadge>{shipment.status}</StatusBadge></td><td>{shipment.arrival}</td><td>⋮</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="table-footer"><span>Showing {dashboard.recentShipments.length} recent shipments</span><div><button>Prev</button><button className="dark">Next</button></div></footer>
      </article>
    </>
  )
}
