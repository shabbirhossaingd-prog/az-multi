const envBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function getApiBase() {
  const saved = typeof window !== 'undefined' ? (localStorage.getItem('az-api-base-url') || '') : ''
  return (saved || envBase).replace(/\/$/, '')
}

export const apiBaseConfigured = Boolean(getApiBase())

export function saveApiBaseUrl(url) {
  const clean = String(url || '').trim().replace(/\/$/, '')
  if (!clean) {
    localStorage.removeItem('az-api-base-url')
    return ''
  }
  if (!/^https?:\/\//i.test(clean)) throw new Error('Use a full http:// or https:// API gateway URL.')
  localStorage.setItem('az-api-base-url', clean)
  return clean
}

export function oauthUrl(provider) {
  const base = getApiBase()
  if (!base) return null
  const returnTo = encodeURIComponent(window.location.origin)
  return `${base}/oauth/${String(provider).toLowerCase()}?returnTo=${returnTo}`
}

export async function apiRequest(path, options = {}) {
  const base = getApiBase()
  if (!base) throw new Error('Backend API is not configured yet. Add an API Gateway URL from AI Core / Settings.')
  const response = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`)
  return data
}

export async function generateWithAI(payload) {
  return apiRequest('/api/ai/generate', { method: 'POST', body: JSON.stringify(payload) })
}

export async function saveAIProviderSecret(payload) {
  return apiRequest('/api/settings/ai-provider', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function testAIConnection(payload = {}) {
  return apiRequest('/api/ai/test', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getAIStatus() {
  return apiRequest('/api/ai/status')
}

export async function publishSocialPost(payload) {
  return apiRequest('/api/social/publish', { method: 'POST', body: JSON.stringify(payload) })
}

export async function launchAdsCampaign(payload) {
  return apiRequest('/api/ads/launch', { method: 'POST', body: JSON.stringify(payload) })
}

export function downloadText(filename, text, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function toCSV(rows) {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  return [keys.map(escape).join(','), ...rows.map((row) => keys.map((key) => escape(row[key])).join(','))].join('\n')
}
