const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: normalizedMethod,
    credentials: 'include',
    headers: requestHeaders,
    body: hasBody ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { message: await response.text() }

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed')
  }

  return payload
}
