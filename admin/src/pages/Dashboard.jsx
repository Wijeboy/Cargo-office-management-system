import { AlertCircle, DollarSign, Package, Truck, UsersRound } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { recentShipments } from '../data/adminData'

const bars = [245, 310, 285, 400, 355, 480, 425]
const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Warehouse Dashboard Overview" subtitle="Real-time intelligence and fleet logistics monitoring" />
      <section className="stats-grid">
        <StatCard icon={Truck} label="Total Shipments" value="12,450" trend="+12.5%" />
        <StatCard icon={DollarSign} label="Revenue" value="$842k" trend="-2.4%" tone="red" />
        <StatCard icon={UsersRound} label="Active Users" value="1,205" trend="+5.7%" tone="green" />
        <StatCard icon={AlertCircle} label="Pending Deliveries" value="428" trend="+18.2%" tone="orange" />
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
              {bars.map((height, index) => (
                <div className="bar-column" key={days[index]}>
                  <span className="bar" style={{ height: `${height / 1.35}px` }} />
                  <small>{days[index]}</small>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel health-panel">
          <div className="panel-title"><div><h2>System Health</h2><p>Real-time delivery status tracking</p></div></div>
          <div className="donut"><div><strong>94%</strong><span>Efficiency</span></div></div>
          <ul className="legend">
            <li><i className="green" /> Delivered <b>72%</b></li>
            <li><i className="blue" /> In Transit <b>22%</b></li>
            <li><i className="red" /> Delayed <b>6%</b></li>
          </ul>
        </article>
      </section>

      <article className="panel recent-panel">
        <div className="panel-title bordered"><h2>Recent Shipments</h2><a>View All ›</a></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Destination</th><th>Status</th><th>Arrival</th><th>Action</th></tr></thead>
            <tbody>
              {recentShipments.map(([id, initials, name, destination, status, arrival]) => (
                <tr key={id}>
                  <td><a>{id}</a></td>
                  <td><span className="person"><i className="avatar">{initials}</i>{name}</span></td>
                  <td>{destination}</td><td><StatusBadge>{status}</StatusBadge></td><td>{arrival}</td><td>⋮</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="table-footer"><span>Showing 4 of 428 shipments</span><div><button>Prev</button><button className="dark">Next</button></div></footer>
      </article>
    </>
  )
}
