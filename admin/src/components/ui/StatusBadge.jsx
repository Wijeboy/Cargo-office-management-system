const iconMap = {
  'In Transit': '↗',
  Dispatched: '↗',
  'Pending Pickup': '◷',
  Processing: '◇',
  Delivered: '✓',
}

export default function StatusBadge({ children }) {
  const slug = String(children).toLowerCase().replaceAll(' ', '-')
  return <span className={`status status-${slug}`}>{iconMap[children]} {children}</span>
}
