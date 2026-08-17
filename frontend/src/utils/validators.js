export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function passwordStrength(value = '') {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-danger-500', 'bg-danger-500', 'bg-warning-500', 'bg-info-500', 'bg-success-500']
  const idx = Math.max(0, Math.min(score - 1, 4))
  return {
    score,
    percent: (score / 5) * 100,
    label: value ? labels[idx] : '',
    color: value ? colors[idx] : 'bg-surface-muted',
  }
}

export function required(value) {
  if (Array.isArray(value)) return value.length > 0 ? '' : 'This field is required.'
  return value?.toString().trim() ? '' : 'This field is required.'
}
