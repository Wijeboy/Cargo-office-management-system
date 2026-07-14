import { useEffect, useState } from 'react'
import { CircleCheck, Grid3X3, Package, PieChart } from 'lucide-react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import ActionModal from '../components/ui/ActionModal'
import { warehouseApi } from '../services/warehouseApi'

const emptyStorageForm = {
  sectionCode: '',
  zone: 'Zone A',
  location: '',
  currentItems: '',
  occupiedUnits: 0,
  capacityUnits: 50,
}

export default function StorageAllocation() {
  const [sections, setSections] = useState([])
  const [rows, setRows] = useState([])
  const [zones, setZones] = useState([])
  const [stats, setStats] = useState({ totalCapacity: 0, occupied: 0, available: 0, occupancyRate: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [modal, setModal] = useState({ type: null, section: null })
  const [form, setForm] = useState(emptyStorageForm)
  const [submitting, setSubmitting] = useState(false)

  const loadStorage = async () => {
    setLoading(true)
    setError('')
    try {
      const [sectionsData, statsData] = await Promise.all([
        warehouseApi.storage(search),
        warehouseApi.storageStats(),
      ])
      setSections(sectionsData.sections)
      setRows(sectionsData.sections.map((section) => section.tableRow))
      setStats(statsData.stats)
      setZones(statsData.stats.zones)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [sectionsData, statsData] = await Promise.all([
          warehouseApi.storage(search),
          warehouseApi.storageStats(),
        ])
        if (!ignore) {
          setSections(sectionsData.sections)
          setRows(sectionsData.sections.map((section) => section.tableRow))
          setStats(statsData.stats)
          setZones(statsData.stats.zones)
        }
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [search])

  const handleAddSection = async () => {
    setForm(emptyStorageForm)
    setModal({ type: 'create', section: null })
  }

  const handleEditSection = async (section) => {
    setForm({
      sectionCode: section.sectionCode,
      zone: section.zone,
      location: section.location,
      currentItems: section.currentItems || '',
      occupiedUnits: section.occupiedUnits,
      capacityUnits: section.capacityUnits,
    })
    setModal({ type: 'edit', section })
  }

  const handleDeleteSection = async (section) => {
    setModal({ type: 'delete', section })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const closeModal = () => {
    setModal({ type: null, section: null })
    setSubmitting(false)
  }

  const handleSubmitSection = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    const payload = {
      ...form,
      occupiedUnits: Number(form.occupiedUnits || 0),
      capacityUnits: Number(form.capacityUnits || 0),
    }
    try {
      if (modal.type === 'create') {
        await warehouseApi.createStorage(payload)
        setMessage('Storage section created successfully.')
      } else {
        await warehouseApi.updateStorage(modal.section.id, payload)
        setMessage('Storage section updated successfully.')
      }
      await loadStorage()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await warehouseApi.deleteStorage(modal.section.id)
      setMessage('Storage section deleted successfully.')
      await loadStorage()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

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
        <StatCard icon={Grid3X3} label="Total Capacity" value={stats.totalCapacity} suffix="units" />
        <StatCard icon={Package} label="Occupied" value={stats.occupied} suffix="units" tone="yellow" />
        <StatCard icon={CircleCheck} label="Available" value={stats.available} suffix="units" tone="green" />
        <StatCard icon={PieChart} label="Occupancy Rate" value={`${stats.occupancyRate}%`} tone="purple" />
      </section>
      <article className="panel zones-panel">
        <h2>Storage Zones Overview</h2>
        <div className="zones">
          {zones.map((zone) => (
            <div className={`zone ${zone.utilization >= 90 ? 'danger' : zone.utilization >= 70 ? 'warn' : 'good'}`} key={zone.zone}>
              <strong>{zone.zone.replace('Zone ', '')}</strong><span>{zone.sections}<br />sections</span>
              <div className="progress"><i style={{ width: `${zone.utilization}%` }} /></div>
              <b>{zone.amountLabel}</b><small>{zone.utilization}% full</small>
            </div>
          ))}
        </div>
      </article>
      <SearchBar placeholder="Search sections by ID or items..." action="Add Section" value={search} onChange={setSearch} onAction={handleAddSection} />
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
      <DataTable
        columns={['Section ID', 'Zone', 'Location', 'Current Items', 'Capacity', 'Utilization', 'Status']}
        rows={rows}
        renderCell={renderCell}
        renderActions={(row, rowIndex) => (
          <span className="row-actions">
            <button onClick={() => handleEditSection(sections[rowIndex])}>Edit</button>
            <button onClick={() => handleDeleteSection(sections[rowIndex])}>Delete</button>
          </span>
        )}
        loading={loading}
      />
      <ActionModal
        open={modal.type === 'create' || modal.type === 'edit'}
        title={modal.type === 'create' ? 'Add Storage Section' : 'Edit Storage Section'}
        subtitle="Manage zone capacity and current item allocation."
        submitLabel={modal.type === 'create' ? 'Create Section' : 'Save Changes'}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmitSection}
      >
        <div className="modal-grid">
          <label className="modal-field"><strong>Section ID</strong><input name="sectionCode" value={form.sectionCode} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Zone</strong><input name="zone" value={form.zone} onChange={handleChange} required /></label>
          <label className="modal-field wide"><strong>Location</strong><input name="location" value={form.location} onChange={handleChange} required /></label>
          <label className="modal-field wide"><strong>Current Items</strong><input name="currentItems" value={form.currentItems} onChange={handleChange} placeholder="Leave blank if available" /></label>
          <label className="modal-field"><strong>Occupied Units</strong><input name="occupiedUnits" value={form.occupiedUnits} onChange={handleChange} type="number" min="0" /></label>
          <label className="modal-field"><strong>Capacity Units</strong><input name="capacityUnits" value={form.capacityUnits} onChange={handleChange} type="number" min="1" required /></label>
        </div>
      </ActionModal>
      <ActionModal open={modal.type === 'delete'} title="Delete Storage Section" subtitle="This removes the warehouse section record." submitLabel="Delete Section" tone="danger" submitting={submitting} onClose={closeModal} onSubmit={handleConfirmDelete}>
        <p className="confirm-copy">Are you sure you want to delete <strong>{modal.section?.sectionCode}</strong>? This action cannot be undone.</p>
      </ActionModal>
    </>
  )
}
