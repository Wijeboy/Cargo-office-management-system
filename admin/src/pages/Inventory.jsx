import { useEffect, useState } from 'react'
import { Boxes, PackageCheck, PackageX, TriangleAlert } from 'lucide-react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import ActionModal from '../components/ui/ActionModal'
import { warehouseApi } from '../services/warehouseApi'

const emptyInventoryForm = {
  itemCode: '',
  name: '',
  category: 'General',
  quantity: 0,
  location: '',
  weight: 0,
  minStock: 10,
}

export default function Inventory() {
  const [items, setItems] = useState([])
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({ totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [modal, setModal] = useState({ type: null, item: null })
  const [form, setForm] = useState(emptyInventoryForm)
  const [submitting, setSubmitting] = useState(false)

  const loadInventory = async () => {
    setLoading(true)
    setError('')
    try {
      const [itemsData, statsData] = await Promise.all([
        warehouseApi.inventory(search),
        warehouseApi.inventoryStats(),
      ])
      setItems(itemsData.items)
      setRows(itemsData.items.map((item) => item.tableRow))
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
        const [itemsData, statsData] = await Promise.all([
          warehouseApi.inventory(search),
          warehouseApi.inventoryStats(),
        ])
        if (!ignore) {
          setItems(itemsData.items)
          setRows(itemsData.items.map((item) => item.tableRow))
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

  const handleAddItem = async () => {
    setForm(emptyInventoryForm)
    setModal({ type: 'create', item: null })
  }

  const handleExport = () => {
    const headers = ['Item ID', 'Item Name', 'Category', 'Quantity', 'Location', 'Weight', 'Status', 'Last Updated']
    const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `warehouse-log-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleEditItem = async (item) => {
    setForm({
      itemCode: item.itemCode,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      weight: item.weight,
      minStock: item.minStock,
    })
    setModal({ type: 'edit', item })
  }

  const handleDeleteItem = async (item) => {
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

  const handleSubmitItem = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    const payload = {
      ...form,
      quantity: Number(form.quantity || 0),
      weight: Number(form.weight || 0),
      minStock: Number(form.minStock || 0),
    }
    try {
      if (modal.type === 'create') {
        await warehouseApi.createInventory(payload)
        setMessage('Inventory item created successfully.')
      } else {
        await warehouseApi.updateInventory(modal.item.id, payload)
        setMessage('Inventory item updated successfully.')
      }
      await loadInventory()
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
      await warehouseApi.deleteInventory(modal.item.id)
      setMessage('Inventory item deleted successfully.')
      await loadInventory()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderCell = (cell, index) => {
    if (index === 0) return <a>{cell}</a>
    if (index === 2) return <span className="category-badge">{cell}</span>
    if (index === 6) return <StatusBadge>{cell}</StatusBadge>
    return cell
  }

  return (
    <>
      <PageHeader title="Warehouse Log" subtitle="Accurate live inventory, stock levels, locations, and item movement records" />
      <SearchBar placeholder="Search warehouse log by item name, ID, category, or location..." action="Add Item" exportButton value={search} onChange={setSearch} onAction={handleAddItem} onExport={handleExport} />
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
      <section className="stats-grid compact">
        <StatCard icon={Boxes} label="Total Items" value={stats.totalItems} suffix={`${stats.totalStockUnits || 0} stock units`} />
        <StatCard icon={PackageCheck} label="In-Stock Items" value={stats.inStock} tone="green" />
        <StatCard icon={TriangleAlert} label="Low-Stock Items" value={stats.lowStock} tone="yellow" />
        <StatCard icon={PackageX} label="Out-of-Stock Items" value={stats.outOfStock} tone="red" />
      </section>
      <DataTable
        columns={['Item ID ↕', 'Item Name ↕', 'Category', 'Quantity ↕', 'Location', 'Weight', 'Status', 'Last Updated']}
        rows={rows}
        renderCell={renderCell}
        renderActions={(row, rowIndex) => (
          <span className="row-actions">
            <button onClick={() => handleEditItem(items[rowIndex])}>Edit</button>
            <button onClick={() => handleDeleteItem(items[rowIndex])}>Delete</button>
          </span>
        )}
        loading={loading}
      />
      <ActionModal
        open={modal.type === 'create' || modal.type === 'edit'}
        title={modal.type === 'create' ? 'Add Inventory Item' : 'Edit Inventory Item'}
        subtitle="Keep stock levels, locations, and weight details up to date."
        submitLabel={modal.type === 'create' ? 'Create Item' : 'Save Changes'}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmitItem}
      >
        <div className="modal-grid">
          <label className="modal-field"><strong>Item ID</strong><input name="itemCode" value={form.itemCode} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Item Name</strong><input name="name" value={form.name} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Category</strong><input name="category" value={form.category} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Location</strong><input name="location" value={form.location} onChange={handleChange} required /></label>
          <label className="modal-field"><strong>Quantity</strong><input name="quantity" value={form.quantity} onChange={handleChange} type="number" min="0" required /></label>
          <label className="modal-field"><strong>Minimum Stock</strong><input name="minStock" value={form.minStock} onChange={handleChange} type="number" min="0" /></label>
          <label className="modal-field wide"><strong>Weight (kg)</strong><input name="weight" value={form.weight} onChange={handleChange} type="number" min="0" step="0.01" /></label>
        </div>
      </ActionModal>
      <ActionModal
        open={modal.type === 'delete'}
        title="Delete Inventory Item"
        subtitle="This removes the item from warehouse inventory."
        submitLabel="Delete Item"
        tone="danger"
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleConfirmDelete}
      >
        <p className="confirm-copy">Are you sure you want to delete <strong>{modal.item?.itemCode}</strong>? This action cannot be undone.</p>
      </ActionModal>
    </>
  )
}
