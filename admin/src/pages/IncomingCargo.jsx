import { useEffect, useState } from 'react'
import { AlertCircle, Clock, Package, PackagePlus } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import ActionModal from '../components/ui/ActionModal'
import { warehouseApi } from '../services/warehouseApi'

const emptyIncomingForm = {
  cargoCode: '',
  senderCompany: '',
  origin: '',
  itemName: '',
  quantity: 0,
  weight: 0,
  expectedArrival: new Date().toISOString().slice(0, 10),
  status: 'In Transit',
  progress: 0,
}

export default function IncomingCargo() {
  const [shipments, setShipments] = useState([])
  const [stats, setStats] = useState({ totalIncoming: 0, inTransit: 0, arrivingSoon: 0, delayed: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [modal, setModal] = useState({ type: null, shipment: null })
  const [form, setForm] = useState(emptyIncomingForm)
  const [submitting, setSubmitting] = useState(false)

  const loadIncomingCargo = async () => {
    setLoading(true)
    setError('')
    try {
      const [cargoData, statsData] = await Promise.all([
        warehouseApi.incoming(search),
        warehouseApi.incomingStats(),
      ])
      setShipments(cargoData.cargo)
      setStats(statsData.stats)
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
        const [cargoData, statsData] = await Promise.all([
          warehouseApi.incoming(search),
          warehouseApi.incomingStats(),
        ])
        if (!ignore) {
          setShipments(cargoData.cargo)
          setStats(statsData.stats)
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

  const handleAddCargo = async () => {
    setForm(emptyIncomingForm)
    setModal({ type: 'create', shipment: null })
  }

  const handleUpdateStatus = async (shipment) => {
    setForm({
      cargoCode: shipment.cargoCode,
      senderCompany: shipment.senderCompany,
      origin: shipment.origin,
      itemName: shipment.itemName,
      quantity: shipment.quantity,
      weight: shipment.weight,
      expectedArrival: shipment.expectedArrival?.slice(0, 10) || '',
      status: shipment.status,
      progress: shipment.progress,
    })
    setModal({ type: 'status', shipment })
  }

  const handleDeleteCargo = async (shipment) => {
    setModal({ type: 'delete', shipment })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const closeModal = () => {
    setModal({ type: null, shipment: null })
    setSubmitting(false)
  }

  const handleSubmitCargo = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await warehouseApi.createIncoming({
        ...form,
        quantity: Number(form.quantity || 0),
        weight: Number(form.weight || 0),
        progress: Number(form.progress || 0),
      })
      setMessage('Incoming cargo created successfully.')
      await loadIncomingCargo()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitStatus = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await warehouseApi.updateIncoming(modal.shipment.id, { status: form.status, progress: Number(form.progress || 0) })
      setMessage('Incoming cargo status updated successfully.')
      await loadIncomingCargo()
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
      await warehouseApi.deleteIncoming(modal.shipment.id)
      setMessage('Incoming cargo deleted successfully.')
      await loadIncomingCargo()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Incoming Cargo" subtitle="Track and manage incoming shipments to warehouse" />
      <section className="stats-grid compact">
        <StatCard icon={PackagePlus} label="Total Incoming" value={stats.totalIncoming} />
        <StatCard icon={Package} label="In Transit" value={stats.inTransit} tone="yellow" />
        <StatCard icon={Clock} label="Arriving Soon" value={stats.arrivingSoon} />
        <StatCard icon={AlertCircle} label="Delayed" value={stats.delayed} tone="red" />
      </section>
      <SearchBar placeholder="Search by sender, ID, or items..." action="Add Cargo" value={search} onChange={setSearch} onAction={handleAddCargo} />
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
      <section className="shipment-list">
        {loading && <article className="shipment-card">Loading incoming cargo...</article>}
        {!loading && shipments.length === 0 && <article className="shipment-card">No incoming cargo found.</article>}
        {shipments.map((shipment) => (
          <article className="shipment-card" key={shipment.id}>
            <div className={`shipment-mark ${shipment.tone}`}><PackagePlus /></div>
            <div className="shipment-body">
              <div className="shipment-head">
                <div><h2><a>{shipment.cargoCode}</a> <StatusBadge>{shipment.status}</StatusBadge></h2><strong>{shipment.company}</strong><p>From: {shipment.from}</p></div>
                <div className="arrival"><span>Expected Arrival</span><strong>{shipment.dateLabel}</strong></div>
              </div>
              <div className="shipment-meta">
                <div><span>Items</span><strong>{shipment.item}</strong></div>
                <div><span>Quantity</span><strong>{shipment.quantityLabel}</strong></div>
                <div><span>Weight</span><strong>{shipment.weightLabel}</strong></div>
                <div><span>Progress</span><strong>{shipment.progress}%</strong></div>
              </div>
              <div className="progress"><span className={shipment.tone} style={{ width: `${shipment.progress}%` }} /></div>
              <div className="shipment-actions">
                <button onClick={() => setModal({ type: 'details', shipment })}>View Details</button>
                <button onClick={() => handleDeleteCargo(shipment)}>Delete</button>
                <button className="button primary" onClick={() => handleUpdateStatus(shipment)}>Update Status</button>
              </div>
            </div>
          </article>
        ))}
      </section>
      <ActionModal open={modal.type === 'create'} title="Add Incoming Cargo" subtitle="Register cargo expected to arrive at the warehouse." submitLabel="Create Cargo" submitting={submitting} onClose={closeModal} onSubmit={handleSubmitCargo}>
        <div className="modal-grid">
          <label className="modal-field"><strong>Incoming ID</strong><input name="cargoCode" value={form.cargoCode} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Sender Company</strong><input name="senderCompany" value={form.senderCompany} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>From</strong><input name="origin" value={form.origin} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Item Name</strong><input name="itemName" value={form.itemName} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Quantity</strong><input name="quantity" value={form.quantity} onChange={handleChange} type="number" min="0" /></label>
          <label className="modal-field"><strong>Weight (kg)</strong><input name="weight" value={form.weight} onChange={handleChange} type="number" min="0" step="0.01" /></label>
          <label className="modal-field"><strong>Expected Arrival</strong><input name="expectedArrival" value={form.expectedArrival} onChange={handleChange} type="date" /></label>
          <label className="modal-field"><strong>Status</strong><select name="status" value={form.status} onChange={handleChange}><option>In Transit</option><option>Arriving Soon</option><option>Delayed</option><option>Received</option></select></label>
        </div>
      </ActionModal>
      <ActionModal open={modal.type === 'status'} title="Update Incoming Status" subtitle={modal.shipment?.cargoCode} submitLabel="Update Status" submitting={submitting} onClose={closeModal} onSubmit={handleSubmitStatus}>
        <div className="modal-grid">
          <label className="modal-field"><strong>Status</strong><select name="status" value={form.status} onChange={handleChange}><option>In Transit</option><option>Arriving Soon</option><option>Delayed</option><option>Received</option></select></label>
          <label className="modal-field"><strong>Progress %</strong><input name="progress" value={form.progress} onChange={handleChange} type="number" min="0" max="100" /></label>
        </div>
      </ActionModal>
      <ActionModal open={modal.type === 'details'} title="Incoming Cargo Details" subtitle={modal.shipment?.cargoCode} submitLabel="Close" onClose={closeModal} onSubmit={(event) => { event.preventDefault(); closeModal() }}>
        <dl className="detail-list">
          <div><dt>Company</dt><dd>{modal.shipment?.company}</dd></div>
          <div><dt>Origin</dt><dd>{modal.shipment?.from}</dd></div>
          <div><dt>Item</dt><dd>{modal.shipment?.item}</dd></div>
          <div><dt>Quantity</dt><dd>{modal.shipment?.quantityLabel}</dd></div>
          <div><dt>Weight</dt><dd>{modal.shipment?.weightLabel}</dd></div>
          <div><dt>Expected Arrival</dt><dd>{modal.shipment?.dateLabel}</dd></div>
          <div><dt>Status</dt><dd>{modal.shipment?.status}</dd></div>
        </dl>
      </ActionModal>
      <ActionModal open={modal.type === 'delete'} title="Delete Incoming Cargo" subtitle="This removes the incoming cargo record." submitLabel="Delete Cargo" tone="danger" submitting={submitting} onClose={closeModal} onSubmit={handleConfirmDelete}>
        <p className="confirm-copy">Are you sure you want to delete <strong>{modal.shipment?.cargoCode}</strong>? This action cannot be undone.</p>
      </ActionModal>
    </>
  )
}
