export default function StatCard({ icon: Icon, label, value, tone = 'blue', suffix, trend }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20} strokeWidth={1.8} /></div>
      {trend && <span className={`trend ${tone}`}>{trend}</span>}
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {suffix && <small>{suffix}</small>}
      </div>
      {trend && <div className={`stat-line ${tone}`} />}
    </article>
  )
}
