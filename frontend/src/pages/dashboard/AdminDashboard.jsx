import { useState } from 'react';
import { MOCK_DASHBOARD_STATS, MOCK_SHIPMENTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const STATUS_MAP = {
  IN_TRANSIT: { label: 'In Transit', class: 'badge-warning', dot: 'bg-secondary status-pulse' },
  DELIVERED: { label: 'Delivered', class: 'badge-success', dot: 'bg-[#10b981]' },
  DELAYED: { label: 'Delayed', class: 'badge-danger', dot: 'bg-error animate-ping' },
  PENDING: { label: 'Pending', class: 'badge-neutral', dot: 'bg-outline' },
  CANCELLED: { label: 'Cancelled', class: 'badge-danger', dot: 'bg-error' },
};

function KPICard({ icon, iconBg, iconColor, label, value, trend, trendUp, progress, progressColor, delay = 0 }) {
  return (
    <div className="card-hover p-6 relative overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${iconBg} rounded-lg ${iconColor} animate-float`} style={{ animationDelay: `${delay * 0.2}s` }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'text-accent bg-tertiary-fixed' : 'text-error bg-error-container'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-on-surface-variant text-label-md uppercase tracking-wide">{label}</h3>
      <p className="text-on-surface text-numeric-kpi mt-1">{value}</p>
      <div className="mt-4 progress-bar">
        <div className={`progress-fill ${progressColor}`} style={{ width: progress }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const stats = MOCK_DASHBOARD_STATS;
  const [volumeFilter, setVolumeFilter] = useState('Weekly');
  const maxVol = Math.max(...stats.weeklyVolume.map(d => d.value));

  const recentShipments = MOCK_SHIPMENTS.slice(0, 5);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-slide-up">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time intelligence and fleet logistics monitoring</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-sm py-2 px-4">
            <span className="material-symbols-outlined text-base">download</span>
            Export
          </button>
          <button className="btn-primary text-sm py-2 px-4">
            <span className="material-symbols-outlined text-base">add</span>
            New Shipment
          </button>
        </div>
      </div>

      {/* ── Welcome Banner ── */}
      <div className="card p-5 flex items-center gap-4 bg-gradient-to-r from-primary to-primary-container border-none">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined material-symbols-filled text-white text-2xl">waving_hand</span>
        </div>
        <div>
          <p className="text-white font-semibold text-body-md">Welcome back, {user?.name?.split(' ')[0]}! 👋</p>
          <p className="text-primary-fixed-dim text-body-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon="local_shipping" iconBg="bg-primary-fixed" iconColor="text-on-primary-fixed"
          label="Total Shipments" value="12,450" trend="+12.5%" trendUp
          progress="75%" progressColor="bg-primary" delay={0}
        />
        <KPICard
          icon="payments" iconBg="bg-secondary-container" iconColor="text-on-secondary-container"
          label="Revenue" value="$842k" trend="-2.4%" trendUp={false}
          progress="50%" progressColor="bg-secondary" delay={100}
        />
        <KPICard
          icon="group" iconBg="bg-tertiary-fixed" iconColor="text-on-tertiary-fixed"
          label="Active Users" value="1,205" trend="+5.7%" trendUp
          progress="80%" progressColor="bg-primary-container" delay={200}
        />
        <KPICard
          icon="pending_actions" iconBg="bg-error-container" iconColor="text-on-error-container"
          label="Pending Deliveries" value="428" trend="+18.2%" trendUp
          progress="25%" progressColor="bg-error" delay={300}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Volume */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-on-surface font-semibold text-body-lg">Shipment Volume</h3>
              <p className="text-on-surface-variant text-body-sm">Last 7 Days Performance</p>
            </div>
            <select
              className="bg-surface-container text-sm rounded-lg border border-outline-variant px-3 py-1.5 text-on-surface focus:outline-none focus:ring-1 focus:ring-accent"
              value={volumeFilter}
              onChange={e => setVolumeFilter(e.target.value)}
            >
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 px-1">
            {stats.weeklyVolume.map((d, i) => (
              <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full bg-primary-fixed-dim rounded-t-md hover:bg-accent transition-colors duration-200 cursor-pointer relative group"
                  style={{ height: `${(d.value / maxVol) * 100}%` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.value}
                  </div>
                </div>
                <span className="text-xs font-bold text-on-surface-variant">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut: Status Distribution */}
        <div className="card p-6">
          <div className="mb-6">
            <h3 className="text-on-surface font-semibold text-body-lg">System Health</h3>
            <p className="text-on-surface-variant text-body-sm">Real-time delivery status tracking</p>
          </div>
          <div className="flex items-center justify-center gap-8">
            {/* CSS Donut */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
                {/* Background */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#efedef" strokeWidth="3.5" />
                {/* Delivered 72% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#041627" strokeWidth="3.5"
                  strokeDasharray={`${72} ${100 - 72}`} strokeLinecap="round" />
                {/* In Transit 22% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#505f76" strokeWidth="3.5"
                  strokeDasharray={`${22} ${100 - 22}`}
                  strokeDashoffset={`${-72}`} strokeLinecap="round" />
                {/* Delayed 6% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ba1a1a" strokeWidth="3.5"
                  strokeDasharray={`${6} ${100 - 6}`}
                  strokeDashoffset={`${-(72 + 22)}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-on-surface">94%</p>
                <p className="text-xs text-on-surface-variant font-medium">Efficiency</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { color: 'bg-primary', label: 'Delivered', pct: '72%' },
                { color: 'bg-secondary', label: 'In Transit', pct: '22%' },
                { color: 'bg-error', label: 'Delayed', pct: '6%' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                  <span className="text-sm font-medium text-on-surface">{item.label}</span>
                  <span className="text-sm text-on-surface-variant ml-auto">{item.pct}</span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-outline-variant">
                <p className="text-xs text-on-surface-variant">Total: <span className="font-semibold text-on-surface">12,450 shipments</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Shipments Table ── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <h3 className="text-on-surface font-semibold text-body-lg">Recent Shipments</h3>
          <button className="text-accent text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Arrival</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.map(s => {
                const st = STATUS_MAP[s.status] || STATUS_MAP.PENDING;
                return (
                  <tr key={s.id}>
                    <td className="font-medium text-accent">#{s.shipmentCode}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed flex-shrink-0">
                          {s.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium">{s.customerName}</span>
                      </div>
                    </td>
                    <td className="text-on-surface-variant">{s.destination}</td>
                    <td>
                      <span className={`badge ${st.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="text-on-surface-variant">
                      {s.deliveryDate ? new Date(s.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="text-right">
                      <button className="btn-ghost p-1.5">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">Showing {recentShipments.length} of {stats.totalShipments.toLocaleString()} shipments</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-semibold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">Prev</button>
            <button className="px-3 py-1 text-xs font-semibold bg-primary text-on-primary rounded-lg">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
