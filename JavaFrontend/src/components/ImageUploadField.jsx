import { ImagePlus, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { imageUrl } from '../services/axiosClient'
import { uploadApi } from '../services/goalStoreApi'
import { getErrorMessage } from '../utils/http'

function ImageUploadField({ value, onChange, label = 'Ảnh hiển thị' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const result = await uploadApi.image(file)
      onChange(result.imageUrl)
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được ảnh.'))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="image-upload-field">
      <span>{label}</span>
      <div className="image-upload-box">
        {value ? (
          <img src={imageUrl(value)} alt="Ảnh đã chọn" />
        ) : (
          <div className="image-upload-empty">
            <ImagePlus size={28} />
            <small>Chưa có ảnh</small>
          </div>
        )}
        <div className="image-upload-actions">
          <button type="button" className="admin-secondary-btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 size={17} /> : <ImagePlus size={17} />}
            {uploading ? 'Đang tải...' : value ? 'Đổi ảnh' : 'Chọn ảnh'}
          </button>
          {value && (
            <button type="button" className="admin-secondary-btn" onClick={() => onChange('')} disabled={uploading}>
              Xóa ảnh
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFile} hidden />
      {value && <small className="image-upload-path">{value}</small>}
      {error && <p className="form-message error">{error}</p>}
    </div>
  )
}

export default ImageUploadField
