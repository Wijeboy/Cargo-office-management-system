import { useState } from 'react'
import Card from '../components/common/Card'
import Toggle from '../components/common/Toggle'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe 
} from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'LogiFlow Cargo Management',
    companyName: 'LogiFlow Systems Inc.',
    contactEmail: 'support@logiflow.com',
    supportPhone: '+1 (555) 123-4567',
    dateFormat: 'MM/DD/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    shipmentUpdates: true,
    inventoryAlerts: true,
    systemMaintenance: true,
  })

  const [originalSettings] = useState({ ...settings })

  const settingCategories = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'localization', label: 'Localization', icon: Globe },
  ]

  const handleInputChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    })
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({ ...originalSettings })
      alert('Settings reset to defaults')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure system preferences and security settings.</p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Settings Categories */}
        <div className="lg:col-span-1">
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {settingCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`w-full px-6 py-4 flex items-center text-left transition-colors ${
                    activeTab === category.id
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <category.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{category.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Manage core system information and default configurations.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => handleInputChange('systemName', e.target.value)}
                    className="input-field"
                    placeholder="Enter system name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This name will be displayed throughout the application
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="input-field"
                    placeholder="Enter company name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Official organization name using the system
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="input-field"
                    placeholder="support@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Primary email for system notifications and support
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                    className="input-field"
                    placeholder="+1 (555) 000-0000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Customer support contact number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    className="input-field"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Preferred date display format across the system
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button onClick={handleReset} className="btn-secondary">
                    Reset to Defaults
                  </button>
                  <button onClick={handleSave} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Control which system notifications you want to receive.
                  </p>
                </div>

                {/* Email Notifications */}
                <div className="flex items-start justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive important system updates via email
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.emailNotifications}
                    onChange={(value) => handleInputChange('emailNotifications', value)}
                    label="Email Notifications"
                  />
                </div>

                {/* SMS Notifications */}
                <div className="flex items-start justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive critical alerts through SMS
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.smsNotifications}
                    onChange={(value) => handleInputChange('smsNotifications', value)}
                    label="SMS Notifications"
                  />
                </div>

                {/* Shipment Updates */}
                <div className="flex items-start justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Shipment Updates</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Notify users when shipment statuses change
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.shipmentUpdates}
                    onChange={(value) => handleInputChange('shipmentUpdates', value)}
                    label="Shipment Updates"
                  />
                </div>

                {/* Inventory Alerts */}
                <div className="flex items-start justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Inventory Alerts</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Alert administrators when stock levels become low
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.inventoryAlerts}
                    onChange={(value) => handleInputChange('inventoryAlerts', value)}
                    label="Inventory Alerts"
                  />
                </div>

                {/* System Maintenance */}
                <div className="flex items-start justify-between py-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">System Maintenance</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive notifications about maintenance schedules and software updates
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.systemMaintenance}
                    onChange={(value) => handleInputChange('systemMaintenance', value)}
                    label="System Maintenance"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button onClick={handleSave} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Manage password and authentication settings.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex items-start justify-between py-4 border-t border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Toggle
                    enabled={false}
                    onChange={() => {}}
                    label="Two-Factor Authentication"
                  />
                </div>

                <div className="flex items-start justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Session Timeout</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically log out after period of inactivity
                    </p>
                  </div>
                  <Toggle
                    enabled={true}
                    onChange={() => {}}
                    label="Session Timeout"
                  />
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button onClick={handleSave} className="btn-primary">
                    Update Password
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Settings</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Manage database backup and maintenance settings.
                  </p>
                </div>

                <div className="flex items-start justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Automatic Backup</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable automatic database backups
                    </p>
                  </div>
                  <Toggle
                    enabled={true}
                    onChange={() => {}}
                    label="Automatic Backup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select className="input-field">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period
                  </label>
                  <select className="input-field">
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                    <option>90 days</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Backup</p>
                    <p className="text-xs text-gray-600 mt-1">January 18, 2024 at 2:30 AM</p>
                  </div>
                  <button className="btn-secondary text-sm">
                    Backup Now
                  </button>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button onClick={handleSave} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Configure SMTP settings for sending emails.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="smtp.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="username@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="noreply@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="LogiFlow System"
                  />
                </div>

                <div className="flex items-start justify-between py-4 border-t border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Enable SSL/TLS</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Use secure connection for email transmission
                    </p>
                  </div>
                  <Toggle
                    enabled={true}
                    onChange={() => {}}
                    label="Enable SSL/TLS"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button className="btn-secondary">
                    Test Connection
                  </button>
                  <button onClick={handleSave} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Localization Settings */}
          {activeTab === 'localization' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization Settings</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Configure language, timezone, and regional preferences.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <select className="input-field">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                    <option>Japanese</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select className="input-field">
                    <option>UTC-08:00 (Pacific Time)</option>
                    <option>UTC-07:00 (Mountain Time)</option>
                    <option>UTC-06:00 (Central Time)</option>
                    <option>UTC-05:00 (Eastern Time)</option>
                    <option>UTC+00:00 (GMT)</option>
                    <option>UTC+01:00 (Central European Time)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select className="input-field">
                    <option>USD ($) - US Dollar</option>
                    <option>EUR (€) - Euro</option>
                    <option>GBP (£) - British Pound</option>
                    <option>JPY (¥) - Japanese Yen</option>
                    <option>CNY (¥) - Chinese Yuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Format
                  </label>
                  <select className="input-field">
                    <option>1,234.56 (US)</option>
                    <option>1.234,56 (EU)</option>
                    <option>1 234,56 (FR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Day of Week
                  </label>
                  <select className="input-field">
                    <option>Sunday</option>
                    <option>Monday</option>
                  </select>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button onClick={handleSave} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}