export const normalizeInviteToken = (raw: string): string => {
  let token = String(raw || '').trim()
  if (!token) return ''
  try {
    token = decodeURIComponent(token)
  } catch {
    // ignore decode errors
  }
  token = token.replace(/^[<(\[{（【《]+/, '')
  token = token.replace(/[>)}\]）】》,，.。!！?？;；:：]+$/g, '')
  return token.trim()
}

export const extractInviteToken = (value: string): string => {
  const input = String(value || '').trim()
  if (!input) return ''
  const matched = input.match(/group\/invite\/([^\s?#&]+)/i)
  if (!matched || !matched[1]) return ''
  const token = normalizeInviteToken(matched[1])
  if (!token) return ''
  if (!/^[A-Za-z0-9_-]{8,}$/.test(token)) return ''
  return token
}

export const buildInvitePath = (token: string): string => {
  const clean = normalizeInviteToken(token)
  if (!clean) return ''
  return `/group/invite/${encodeURIComponent(clean)}`
}
