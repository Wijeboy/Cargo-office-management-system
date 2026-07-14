import { useEffect, useState } from 'react'
import { CheckCircle, Package, PackageCheck, Truck } from 'lucide-react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import ActionModal from '../components/ui/ActionModal'
import { warehouseApi } from '../services/warehouseApi'

const emptyOutgoingForm = {
  shipmentCode: '',
  consignee: '',
  destination: '',
  itemName: '',
  quantity: 0,
  weight: 0,
  shipDate: new Date().toISOString().slice(0, 10),
  status: 'Processing',
  trackingId: '',
}

export default function OutgoingCargo() {
  const [cargo, setCargo] = useState([])
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({ totalOutgoing: 0, processing: 0, inTransit: 0, delivered: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [modal, setModal] = useState({ type: null, item: null })
  const [form, setForm] = useState(emptyOutgoingForm)
  const [submitting, setSubmitting] = useState(false)

  const loadOutgoingCargo = async () => {
    setLoading(true)
    setError('')
    try {
      const [cargoData, statsData] = await Promise.all([
        warehouseApi.outgoing(search),
        warehouseApi.outgoingStats(),
      ])
      setCargo(cargoData.cargo)
      setRows(cargoData.cargo.map((item) => item.tableRow))
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
          warehouseApi.outgoing(search),
          warehouseApi.outgoingStats(),
        ])
        if (!ignore) {
          setCargo(cargoData.cargo)
          setRows(cargoData.cargo.map((cargo) => cargo.tableRow))
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
    setForm(emptyOutgoingForm)
    setModal({ type: 'create', item: null })
  }

  const handleEditCargo = async (item) => {
    setForm({
      shipmentCode: item.shipmentCode,
      consignee: item.consignee,
      destination: item.destination,
      itemName: item.itemName,
      quantity: item.quantity,
      weight: item.weight,
      shipDate: item.shipDate?.slice(0, 10) || '',
      status: item.status,
      trackingId: item.trackingId,
    })
    setModal({ type: 'edit', item })
  }

  const handleDeleteCargo = async (item) => {
    setModal({ type: 'delete', item })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const closeModal = () => {
    setModal({ type: null, item: null })
    setSubmitting(false)
  }

  const handleSubmitCargo = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    const payload = {
      ...form,
      quantity: Number(form.quantity || 0),
      weight: Number(form.weight || 0),
    }
    try {
      if (modal.type === 'create') {
        await warehouseApi.createOutgoing(payload)
        setMessage('Outgoing shipment created successfully.')
      } else {
        await warehouseApi.updateOutgoing(modal.item.id, payload)
        setMessage('Outgoing shipment updated successfully.')
      }
      await loadOutgoingCargo()
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
      await warehouseApi.deleteOutgoing(modal.item.id)
      setMessage('Outgoing shipment deleted successfully.')
      await loadOutgoingCargo()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderCell = (cell, index) => {
    if (index === 0 || index === 7) return <a>{cell}</a>
    if (index === 6) return <StatusBadge>{cell}</StatusBadge>
    return cell
  }

  return (
    <>
      <PageHeader title="Outgoing Cargo" subtitle="Manage and track outgoing shipments from warehouse" />
      <section className="stats-grid compact">
        <StatCard icon={Truck} label="Total Outgoing" value={stats.totalOutgoing} />
        <StatCard icon={Package} label="Processing" value={stats.processing} tone="orange" />
        <StatCard icon={PackageCheck} label="In Transit" value={stats.inTransit} />
        <StatCard icon={CheckCircle} label="Delivered" value={stats.delivered} tone="green" />
      </section>
      <SearchBar placeholder="Search by consignee, ID, or tracking number..." action="Add Shipment" value={search} onChange={setSearch} onAction={handleAddCargo} />
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
      <DataTable
        columns={['Shipment ID', 'Consignee', 'Destination', 'Items', 'Weight', 'Ship Date', 'Status', 'Tracking ID']}
        rows={rows}
        renderCell={renderCell}
        renderActions={(row, rowIndex) => (
          <span className="row-actions">
            <button onClick={() => handleEditCargo(cargo[rowIndex])}>Edit</button>
            <button onClick={() => handleDeleteCargo(cargo[rowIndex])}>Delete</button>
          </span>
        )}
        loading={loading}
      />
      <ActionModal
        open={modal.type === 'create' || modal.type === 'edit'}
        title={modal.type === 'create' ? 'Add Outgoing Shipment' : 'Edit Outgoing Shipment'}
        subtitle="Manage consignee, route, tracking, and dispatch status."
        submitLabel={modal.type === 'create' ? 'Create Shipment' : 'Save Changes'}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmitCargo}
      >
        <div className="modal-grid">
          <label className="modal-field"><strong>Shipment ID</strong><input name="shipmentCode" value={form.shipmentCode} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Tracking ID</strong><input name="trackingId" value={form.trackingId} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Consignee</strong><input name="consignee" value={form.consignee} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Destination</strong><input name="destination" value={form.destination} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Items</strong><input name="itemName" value={form.itemName} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Quantity</strong><input name="quantity" value={form.quantity} onChange={handleChange} type="number" min="0" /></label>
          <label className="modal-field"><strong>Weight (kg)</strong><input name="weight" value={form.weight} onChange={handleChange} type="number" min="0" step="0.01" /></label>
          <label className="modal-field"><strong>Ship Date</strong><input name="shipDate" value={form.shipDate} onChange={handleChange} type="date" /></label>
          <label className="modal-field wide"><strong>Status</strong><select name="status" value={form.status} onChange={handleChange}><option>Processing</option><option>Pending Pickup</option><option>Dispatched</option><option>In Transit</option><option>Delivered</option><option>Delayed</option></select></label>
        </div>
      </ActionModal>
      <ActionModal open={modal.type === 'delete'} title="Delete Outgoing Shipment" subtitle="This removes the shipment record." submitLabel="Delete Shipment" tone="danger" submitting={submitting} onClose={closeModal} onSubmit={handleConfirmDelete}>
        <p className="confirm-copy">Are you sure you want to delete <strong>{modal.item?.shipmentCode}</strong>? This action cannot be undone.</p>
      </ActionModal>
    </>
  )
}
