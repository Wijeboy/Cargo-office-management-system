import { Download, Plus, Search } from 'lucide-react'

export default function SearchBar({ placeholder, action, exportButton = false }) {
  return (
    <div className="filter-bar">
      <label className="search-field">
        <Search size={17} />
        <input placeholder={placeholder} />
      </label>
      <div className="filter-placeholder" />
      <div className="filter-placeholder short" />
      {exportButton && <button className="button secondary"><Download size={16} /> Export</button>}
      {action && <button className="button primary"><Plus size={17} /> {action}</button>}
    </div>
  )
}
