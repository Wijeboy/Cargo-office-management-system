import { useEffect, useState } from 'react'
import { AlertTriangle, Save, Upload } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import ActionModal from '../components/ui/ActionModal'
import { warehouseApi } from '../services/warehouseApi'

const initialForm = {
  shipmentId: '',
  incidentType: '',
  severity: '',
  reportDate: new Date().toISOString().slice(0, 10),
  location: '',
  itemDescription: '',
  quantityAffected: '',
  estimatedValue: '',
  description: '',
  reportedBy: '',
}

function Field({ label, placeholder, wide = false, name, value, onChange, type = 'text' }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label} <b>*</b></span>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} />
    </label>
  )
}

export default function DamageReport() {
  const [form, setForm] = useState(initialForm)
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({ totalReports: 0, underReview: 0, resolved: 0, totalValue: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ type: null, report: null })
  const [statusForm, setStatusForm] = useState({ status: 'Under Review' })

  const loadReports = async () => {
    setLoading(true)
    setError('')
    try {
      const [reportsData, statsData] = await Promise.all([
        warehouseApi.incidents(),
        warehouseApi.incidentStats(),
      ])
      setReports(reportsData.reports)
      setStats(statsData.stats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await warehouseApi.createIncident({
        ...form,
        reportCode: `DMG-${Date.now().toString().slice(-6)}`,
        quantityAffected: Number(form.quantityAffected || 0),
        estimatedValue: Number(form.estimatedValue || 0),
      })
      setForm(initialForm)
      setMessage('Incident report submitted successfully.')
      await loadReports()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateReport = async (report) => {
    setStatusForm({ status: report.status })
    setModal({ type: 'status', report })
  }

  const handleDeleteReport = async (report) => {
    setModal({ type: 'delete', report })
  }

  const closeModal = () => {
    setModal({ type: null, report: null })
    setSubmitting(false)
  }

  const handleSubmitStatus = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await warehouseApi.updateIncident(modal.report.id, { status: statusForm.status })
      setMessage('Incident report updated successfully.')
      await loadReports()
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
      await warehouseApi.deleteIncident(modal.report.id)
      setMessage('Incident report deleted successfully.')
      await loadReports()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Damage/Lost Cargo Report" subtitle="Report and track damaged or lost cargo incidents" />
      <div className="report-layout">
        <form className="panel report-form" onSubmit={handleSubmit}>
          <div className="report-title"><span><AlertTriangle /></span><div><h2>New Incident Report</h2><p>Fill in the details below</p></div></div>
          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}
          <h3>Basic Information</h3>
          <div className="form-grid">
            <Field label="Shipment ID" name="shipmentId" value={form.shipmentId} onChange={handleChange} placeholder="e.g., LOG-2401" />
            <Field label="Incident Type" name="incidentType" value={form.incidentType} onChange={handleChange} placeholder="Damage or Lost" />
            <Field label="Severity Level" name="severity" value={form.severity} onChange={handleChange} placeholder="Minor, Major, Critical" />
            <Field label="Report Date" name="reportDate" value={form.reportDate} onChange={handleChange} type="date" />
          </div>
          <h3>Incident Details</h3>
          <div className="form-grid">
            <Field label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Warehouse A-12" />
            <Field label="Item Description" name="itemDescription" value={form.itemDescription} onChange={handleChange} placeholder="e.g., Machine Parts XYZ-7" />
            <Field label="Quantity Affected" name="quantityAffected" value={form.quantityAffected} onChange={handleChange} placeholder="e.g., 12" type="number" />
            <Field label="Estimated Value (USD)" name="estimatedValue" value={form.estimatedValue} onChange={handleChange} placeholder="e.g., 5000" type="number" />
            <label className="field wide"><span>Incident Description <b>*</b></span><textarea name="description" value={form.description} onChange={handleChange} placeholder="Provide detailed description of the incident..." /></label>
            <Field label="Reported By" name="reportedBy" value={form.reportedBy} onChange={handleChange} placeholder="Your name" wide />
          </div>
          <h3>Supporting Documents</h3>
          <div className="upload-box"><Upload /><strong>Click to upload or drag and drop</strong><span>PDF, JPG, PNG up to 10MB</span></div>
          <div className="form-actions"><button className="button secondary" type="button" onClick={() => setForm(initialForm)}>Cancel</button><button className="button primary" disabled={submitting}><Save size={17} /> {submitting ? 'Submitting...' : 'Submit Report'}</button></div>
        </form>
        <aside className="report-aside">
          <article className="panel report-stats">
            <h2>Report Statistics</h2>
            <p><span>Total Reports</span><b>{stats.totalReports}</b></p><p><span>Under Review</span><b className="blue-text">{stats.underReview}</b></p>
            <p><span>Resolved</span><b className="green-text">{stats.resolved}</b></p><p><span>Total Value</span><b className="red-text">${stats.totalValue.toLocaleString('en-US')}</b></p>
          </article>
          <article className="panel recent-reports">
            <h2>Recent Reports</h2>
            {loading && <div className="report-item">Loading reports...</div>}
            {!loading && reports.slice(0, 5).map((report) => (
              <div className="report-item" key={report.id}>
                <p><a>{report.reportCode}</a><span className={`severity ${report.severity.toLowerCase()}`}>{report.severity}</span></p>
                <small>Shipment: {report.shipmentId}</small><small>{report.reportDateLabel}</small><StatusBadge>{report.status}</StatusBadge>
                <span className="row-actions report-actions">
                  <button onClick={() => handleUpdateReport(report)}>Update</button>
                  <button onClick={() => handleDeleteReport(report)}>Delete</button>
                </span>
              </div>
            ))}
            <a className="view-all">View All Reports</a>
          </article>
        </aside>
      </div>
      <ActionModal open={modal.type === 'status'} title="Update Incident Status" subtitle={modal.report?.reportCode} submitLabel="Update Report" submitting={submitting} onClose={closeModal} onSubmit={handleSubmitStatus}>
        <div className="modal-grid">
          <label className="modal-field wide"><strong>Status</strong><select value={statusForm.status} onChange={(event) => setStatusForm({ status: event.target.value })}><option>Under Review</option><option>Investigating</option><option>Resolved</option><option>Rejected</option></select></label>
        </div>
      </ActionModal>
      <ActionModal open={modal.type === 'delete'} title="Delete Incident Report" subtitle="This removes the report record." submitLabel="Delete Report" tone="danger" submitting={submitting} onClose={closeModal} onSubmit={handleConfirmDelete}>
        <p className="confirm-copy">Are you sure you want to delete <strong>{modal.report?.reportCode}</strong>? This action cannot be undone.</p>
      </ActionModal>
    </>
  )
}
