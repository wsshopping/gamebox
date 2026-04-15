const VIEWPORT_HEIGHT_VAR = '--tg-viewport-height'
const VIEWPORT_STABLE_HEIGHT_VAR = '--tg-viewport-stable-height'
const SAFE_AREA_TOP_VAR = '--tg-safe-area-top'
const SAFE_AREA_BOTTOM_VAR = '--tg-safe-area-bottom'
const SAFE_AREA_LEFT_VAR = '--tg-safe-area-left'
const SAFE_AREA_RIGHT_VAR = '--tg-safe-area-right'

type TelegramThemeParams = {
  bg_color?: string
  text_color?: string
}

type TelegramWebApp = NonNullable<Window['Telegram']>['WebApp']

const toPx = (value?: number | string | null) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`
  }
  if (typeof value === 'string' && value.trim()) {
    return value
  }
  return '0px'
}

const setRootCssVar = (name: string, value: string) => {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty(name, value)
}

const applyViewport = (webApp?: TelegramWebApp | null) => {
  if (typeof document === 'undefined') return

  const viewportHeight = webApp?.viewportHeight
  const stableHeight = webApp?.viewportStableHeight ?? viewportHeight
  setRootCssVar(VIEWPORT_HEIGHT_VAR, viewportHeight ? `${viewportHeight}px` : '100dvh')
  setRootCssVar(VIEWPORT_STABLE_HEIGHT_VAR, stableHeight ? `${stableHeight}px` : '100dvh')

  const safeAreaInset = webApp?.safeAreaInset
  const contentSafeAreaInset = webApp?.contentSafeAreaInset
  setRootCssVar(SAFE_AREA_TOP_VAR, toPx(contentSafeAreaInset?.top ?? safeAreaInset?.top))
  setRootCssVar(SAFE_AREA_BOTTOM_VAR, toPx(contentSafeAreaInset?.bottom ?? safeAreaInset?.bottom))
  setRootCssVar(SAFE_AREA_LEFT_VAR, toPx(contentSafeAreaInset?.left ?? safeAreaInset?.left))
  setRootCssVar(SAFE_AREA_RIGHT_VAR, toPx(contentSafeAreaInset?.right ?? safeAreaInset?.right))
}

const applyTheme = (webApp?: TelegramWebApp | null) => {
  if (typeof document === 'undefined') return
  const body = document.body
  if (!body) return

  body.classList.toggle('telegram-webapp', Boolean(webApp))
  if (!webApp) {
    delete body.dataset.telegramColorScheme
    delete body.dataset.telegramPlatform
    return
  }

  body.dataset.telegramColorScheme = webApp.colorScheme || 'unknown'
  body.dataset.telegramPlatform = webApp.platform || 'unknown'

  const themeParams: TelegramThemeParams | undefined = webApp.themeParams
  if (themeParams?.bg_color) {
    setRootCssVar('--tg-theme-bg', themeParams.bg_color)
  }
  if (themeParams?.text_color) {
    setRootCssVar('--tg-theme-text', themeParams.text_color)
  }
}

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp || null
}

export const isTelegramWebApp = () => Boolean(getTelegramWebApp())

export const initializeTelegramWebApp = () => {
  const webApp = getTelegramWebApp()
  applyViewport(webApp)
  applyTheme(webApp)

  if (!webApp) {
    return () => {}
  }

  webApp.ready?.()
  webApp.expand?.()

  const handleViewportChanged = () => applyViewport(webApp)
  const handleThemeChanged = () => applyTheme(webApp)

  webApp.onEvent?.('viewportChanged', handleViewportChanged)
  webApp.onEvent?.('themeChanged', handleThemeChanged)

  return () => {
    webApp.offEvent?.('viewportChanged', handleViewportChanged)
    webApp.offEvent?.('themeChanged', handleThemeChanged)
  }
}

export const bindTelegramBackButton = (visible: boolean, onBack: () => void) => {
  const webApp = getTelegramWebApp()
  if (!webApp?.BackButton) {
    return () => {}
  }

  if (visible) {
    webApp.BackButton.show?.()
  } else {
    webApp.BackButton.hide?.()
  }

  if (!visible) {
    return () => {}
  }

  const button = webApp.BackButton
  if (button.onClick) {
    button.onClick(onBack)
    return () => {
      button.offClick?.(onBack)
      button.hide?.()
    }
  }

  webApp.onEvent?.('backButtonClicked', onBack)
  return () => {
    webApp.offEvent?.('backButtonClicked', onBack)
    button.hide?.()
  }
}

const resolveAbsoluteUrl = (rawUrl: string) => {
  if (typeof window === 'undefined') {
    return rawUrl
  }
  try {
    return new URL(rawUrl, window.location.origin).toString()
  } catch {
    return rawUrl
  }
}

export const openExternalLink = (
  rawUrl: string,
  target: '_blank' | '_self' = '_blank',
  features = 'noopener,noreferrer'
) => {
  const url = resolveAbsoluteUrl(rawUrl)
  const webApp = getTelegramWebApp()
  if (webApp) {
    try {
      const parsed = new URL(url)
      const isTelegramUrl = /(^|\.)t\.me$|(^|\.)telegram\.me$/i.test(parsed.hostname)
      if (isTelegramUrl && webApp.openTelegramLink) {
        webApp.openTelegramLink(url)
        return
      }
      if (webApp.openLink) {
        webApp.openLink(url, { tryInstantView: false })
        return
      }
    } catch {
      // Fall through to the browser behavior.
    }
  }

  window.open(url, target, features)
}
