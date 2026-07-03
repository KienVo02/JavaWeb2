export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ'
}

export function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function parseSizeInput(value) {
  if (!value) return []
  return value
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [sizeName, stockQuantity] = chunk.split(':').map((item) => item.trim())
      return {
        sizeName,
        stockQuantity: Number(stockQuantity || 0),
      }
    })
    .filter((item) => item.sizeName)
}

export function sizesToInput(sizes = []) {
  return sizes.map((item) => `${item.sizeName}:${item.stockQuantity}`).join(', ')
}
