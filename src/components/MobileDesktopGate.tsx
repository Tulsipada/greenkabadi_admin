import { useEffect, useState, type ReactNode } from 'react'

const PLAY_STORE_URL =
  import.meta.env.VITE_ADMIN_PLAY_STORE_URL || 'https://play.google.com/store'

const MOBILE_MQ = '(max-width: 900px)'

function isMobileViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MQ).matches
}

function PlayStoreIcon() {
  return (
    <svg className="play-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M3.6 2.3c-.3.2-.6.6-.6 1.1v17.2c0 .5.3.9.6 1.1l.1.1 9.6-9.6v-.3L3.7 2.2l-.1.1z"
      />
      <path
        fill="#FBBC04"
        d="M16.1 14.7l-2.8-2.8v-.3l2.8-2.8.1.1 3.3 1.9c.9.5.9 1.4 0 1.9l-3.3 1.9-.1.1z"
      />
      <path
        fill="#4285F4"
        d="M16.2 14.8l-2.9-2.9-9.6 9.6c.4.4 1 .5 1.6.1l10.9-6.8z"
      />
      <path
        fill="#34A853"
        d="M16.2 9.2L3.3 2.4c-.6-.3-1.2-.3-1.6.1l9.6 9.6 2.9-2.9z"
      />
    </svg>
  )
}

function DesktopIcon() {
  return (
    <svg className="desktop-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function MobileDesktopGate({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState(() => isMobileViewport())
  const [showDesktopTip, setShowDesktopTip] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const sync = () => setBlocked(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  if (!blocked) return children

  return (
    <div className="mobile-gate">
      <div className="mobile-gate-card">
        <img className="mobile-gate-logo" src="/logo-mark.png" alt="" />
        <p className="mobile-gate-brand">
          <span className="g">Green</span>
          <span className="ka">क</span>
          <span className="b">Badi</span>
        </p>
        <h1>Admin website is for desktop</h1>
        <p className="mobile-gate-copy">
          This panel is not built for mobile browsers. Use the Admin app on your phone, or open
          this site on a computer.
        </p>

        <a
          className="store-badge"
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PlayStoreIcon />
          <span className="lines">
            <small>Get the Admin app</small>
            <strong>Google Play</strong>
          </span>
        </a>

        <button
          type="button"
          className="btn btn-ghost btn-block mobile-gate-desktop"
          onClick={() => setShowDesktopTip((v) => !v)}
        >
          <DesktopIcon />
          Open on desktop
        </button>

        {showDesktopTip && (
          <div className="mobile-gate-tip">
            <p>
              On your phone browser: open the menu and choose <strong>Desktop site</strong> /{' '}
              <strong>Request desktop site</strong>, then tap Check again.
            </p>
            <p className="muted">Or type this URL on a laptop or PC and sign in there.</p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setBlocked(isMobileViewport())}
            >
              Check again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
