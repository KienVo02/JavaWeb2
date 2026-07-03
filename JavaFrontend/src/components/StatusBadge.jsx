function StatusBadge({ status }) {
  const normalized = status || 'ACTIVE'
  const className = normalized
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, '-')

  return <span className={`status-badge status-${className}`}>{normalized}</span>
}

export default StatusBadge
