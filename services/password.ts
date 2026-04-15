const playerPasswordPattern = /^[A-Za-z0-9]+$/

export const validatePlayerPassword = (password: string, label = '密码') => {
  const clean = password.trim()
  if (!clean) {
    return `${label}不能为空`
  }
  if (clean.length < 6) {
    return `${label}长度至少为 6 位`
  }
  if (!playerPasswordPattern.test(clean)) {
    return `${label}仅支持大小写字母和数字`
  }
  return ''
}
