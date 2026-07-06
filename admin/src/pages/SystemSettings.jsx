import { Bell, Database, Globe2, Mail, Save, Settings as SettingsIcon, Shield } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

const categories = [
  ['General', SettingsIcon], ['Notifications', Bell], ['Security', Shield],
  ['Database', Database], ['Email', Mail], ['Localization', Globe2],
]

export default function SystemSettings() {
  return (
    <>
      <PageHeader title="System Settings" subtitle="Configure system preferences and security settings" />
      <div className="settings-layout">
        <aside className="panel settings-nav">
          {categories.map(([label, Icon], index) => <button className={index === 0 ? 'active' : ''} key={label}><Icon size={19} />{label}</button>)}
        </aside>
        <article className="panel settings-card">
          <h2>General Settings</h2>
          <label className="field"><span>System Name</span><input value="LogiFlow Cargo Management" readOnly /><small>The name displayed across the system</small></label>
          <label className="field"><span>Company Name</span><input value="LogiFlow Systems Inc." readOnly /></label>
          <label className="field"><span>Contact Email</span><input value="support@logiflow.com" readOnly /></label>
          <label className="field"><span>Support Phone</span><input value="+1 (555) 123-4567" readOnly /></label>
          <label className="field"><span>Default Date Format</span><input /></label>
          <div className="form-actions"><button className="button secondary">Reset to Defaults</button><button className="button primary"><Save size={17} /> Save Changes</button></div>
        </article>
      </div>
    </>
  )
}
