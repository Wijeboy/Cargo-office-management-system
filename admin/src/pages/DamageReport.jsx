import { AlertTriangle, Save, Upload } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'

const reports = [
  ['DMG-001', 'Minor', 'LOG-2401', 'Oct 24, 2023', 'Under Review'],
  ['DMG-002', 'Critical', 'LOG-2398', 'Oct 22, 2023', 'Investigating'],
  ['DMG-003', 'Major', 'LOG-2405', 'Oct 23, 2023', 'Resolved'],
  ['DMG-004', 'Minor', 'LOG-2412', 'Oct 25, 2023', 'Under Review'],
]

function Field({ label, placeholder, wide = false }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label} <b>*</b></span>
      <input placeholder={placeholder} />
    </label>
  )
}

export default function DamageReport() {
  return (
    <>
      <PageHeader title="Damage/Lost Cargo Report" subtitle="Report and track damaged or lost cargo incidents" />
      <div className="report-layout">
        <article className="panel report-form">
          <div className="report-title"><span><AlertTriangle /></span><div><h2>New Incident Report</h2><p>Fill in the details below</p></div></div>
          <h3>Basic Information</h3>
          <div className="form-grid">
            <Field label="Shipment ID" placeholder="e.g., LOG-2401" /><Field label="Incident Type" />
            <Field label="Severity Level" /><Field label="Report Date" />
          </div>
          <h3>Incident Details</h3>
          <div className="form-grid">
            <Field label="Location" placeholder="e.g., Warehouse A-12" /><Field label="Item Description" placeholder="e.g., Machine Parts XYZ-7" />
            <Field label="Quantity Affected" placeholder="e.g., 12" /><Field label="Estimated Value (USD)" placeholder="e.g., 5000" />
            <label className="field wide"><span>Incident Description <b>*</b></span><textarea placeholder="Provide detailed description of the incident..." /></label>
            <Field label="Reported By" placeholder="Your name" wide />
          </div>
          <h3>Supporting Documents</h3>
          <div className="upload-box"><Upload /><strong>Click to upload or drag and drop</strong><span>PDF, JPG, PNG up to 10MB</span></div>
          <div className="form-actions"><button className="button secondary">Cancel</button><button className="button primary"><Save size={17} /> Submit Report</button></div>
        </article>
        <aside className="report-aside">
          <article className="panel report-stats">
            <h2>Report Statistics</h2>
            <p><span>Total Reports</span><b>42</b></p><p><span>Under Review</span><b className="blue-text">12</b></p>
            <p><span>Resolved</span><b className="green-text">28</b></p><p><span>Total Value</span><b className="red-text">$124k</b></p>
          </article>
          <article className="panel recent-reports">
            <h2>Recent Reports</h2>
            {reports.map(([id, severity, shipment, date, status]) => (
              <div className="report-item" key={id}>
                <p><a>{id}</a><span className={`severity ${severity.toLowerCase()}`}>{severity}</span></p>
                <small>Shipment: {shipment}</small><small>{date}</small><StatusBadge>{status}</StatusBadge>
              </div>
            ))}
            <a className="view-all">View All Reports</a>
          </article>
        </aside>
      </div>
    </>
  )
}
