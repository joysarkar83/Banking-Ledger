export function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `idmp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
