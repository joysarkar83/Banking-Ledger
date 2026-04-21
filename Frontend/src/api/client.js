const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options
  const hasBody = body !== undefined && body !== null
  const normalizedMethod = String(method).toUpperCase()

  const requestHeaders = {
    ...headers,
  }

  if (hasBody && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json'
  }

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
    const error = new Error(payload?.message || 'Request failed')
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}
