import { X } from 'lucide-react'

export default function ActionModal({
  open,
  title,
  subtitle,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  submitting = false,
  tone = 'default',
}) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="action-modal" role="dialog" aria-modal="true" aria-labelledby="action-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h2 id="action-modal-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </header>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {children}
          </div>
          <footer className="modal-actions">
            <button className="button secondary" type="button" onClick={onClose}>Cancel</button>
            <button className={`button ${tone === 'danger' ? 'danger' : 'primary'}`} disabled={submitting}>{submitting ? 'Working...' : submitLabel}</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
