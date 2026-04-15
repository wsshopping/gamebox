declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        colorScheme?: 'light' | 'dark'
        platform?: string
        themeParams?: {
          bg_color?: string
          text_color?: string
        }
        viewportHeight?: number
        viewportStableHeight?: number
        safeAreaInset?: {
          top?: number
          bottom?: number
          left?: number
          right?: number
        }
        contentSafeAreaInset?: {
          top?: number
          bottom?: number
          left?: number
          right?: number
        }
        ready?: () => void
        expand?: () => void
        openLink?: (url: string, options?: { tryInstantView?: boolean }) => void
        openTelegramLink?: (url: string) => void
        onEvent?: (eventType: string, callback: () => void) => void
        offEvent?: (eventType: string, callback: () => void) => void
        BackButton?: {
          show?: () => void
          hide?: () => void
          onClick?: (callback: () => void) => void
          offClick?: (callback: () => void) => void
        }
      }
    }
  }
}

export {}
