import './globals.css'

export const metadata = {
  title: 'Second Brain',
  description: 'Your personal AI knowledge base',
  manifest: '/manifest.json',
  themeColor: '#0f0f13',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Second Brain'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="theme-color" content="#0f0f13" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />
      </head>
      <body>
        {children}
        <nav className="bottom-nav">
          <a href="/" className="nav-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </a>
          <a href="/add" className="nav-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Add
          </a>
          <a href="/chat" className="nav-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Chat
          </a>
        </nav>
        <script dangerouslySetInnerHTML={{__html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function(reg) { console.log('SW registered'); })
        .catch(function(err) { console.log('SW failed', err); });
    });
  }
`}} />
      </body>
    </html>
  )
}
