import { Save } from 'lucide-react'
import { useState } from 'react'

const defaultSettings = {
  storeName: 'GoalStore',
  hotline: '0901 234 567',
  email: 'support@goalstore.vn',
  address: '123 Nguyễn Trãi, Quận 1, TP.HCM',
  openingHours: '08:00 - 22:00 tất cả các ngày',
}

function AdminSettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem('goalstore_settings') || '{}') }
    } catch {
      return defaultSettings
    }
  })
  const [message, setMessage] = useState('')

  const updateSettings = (event) => {
    setSettings((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const saveSettings = (event) => {
    event.preventDefault()
    localStorage.setItem('goalstore_settings', JSON.stringify(settings))
    setMessage('Đã lưu cài đặt hiển thị.')
    window.setTimeout(() => setMessage(''), 2200)
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div>
          <h1>Cài đặt</h1>
          <p>Thông tin cơ bản hiển thị cho cửa hàng</p>
        </div>
      </div>

      <form className="admin-card admin-form settings-form" onSubmit={saveSettings}>
        <div className="two-col">
          <label>Tên cửa hàng<input name="storeName" value={settings.storeName} onChange={updateSettings} /></label>
          <label>Hotline<input name="hotline" value={settings.hotline} onChange={updateSettings} /></label>
        </div>
        <div className="two-col">
          <label>Email<input name="email" value={settings.email} onChange={updateSettings} /></label>
          <label>Giờ mở cửa<input name="openingHours" value={settings.openingHours} onChange={updateSettings} /></label>
        </div>
        <label>Địa chỉ<textarea name="address" value={settings.address} onChange={updateSettings} /></label>
        {message && <p className="form-message success">{message}</p>}
        <button className="admin-red-btn" type="submit"><Save size={18} /> Lưu cài đặt</button>
      </form>
    </div>
  )
}

export default AdminSettingsPage
