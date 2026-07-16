import { Download, Plus, Search } from 'lucide-react'

export default function SearchBar({ placeholder, action, exportButton = false, value = '', onChange, onAction, onExport }) {
  return (
    <div className="filter-bar">
      <label className="search-field">
        <Search size={17} />
        <input placeholder={placeholder} value={value} onChange={(event) => onChange?.(event.target.value)} />
      </label>
      <div className="filter-placeholder" />
      <div className="filter-placeholder short" />
      {exportButton && <button className="button secondary" onClick={onExport}><Download size={16} /> Export</button>}
      {action && <button className="button primary" onClick={onAction}><Plus size={17} /> {action}</button>}
    </div>
  )
}
