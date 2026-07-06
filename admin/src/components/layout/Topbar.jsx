import { ArrowUp, Menu, Search, Shield } from 'lucide-react'

export default function Topbar({ onMenu }) {
  return (
    <header className="topbar">
      <button className="topbar-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
      <label className="global-search">
        <Search size={17} />
        <input placeholder="Search shipments, fleet, or users..." />
      </label>
      <div className="topbar-actions">
        <button aria-label="Security"><Shield size={20} /></button>
        <button aria-label="Upload"><ArrowUp size={22} /></button>
        <span className="avatar avatar-photo">LF</span>
      </div>
    </header>
  )
}
