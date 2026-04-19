const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export function formatINR(value) {
  const number = Number(value) || 0
  return INR_FORMATTER.format(number)
}
