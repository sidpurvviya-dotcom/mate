import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import MobileBottomNav from '@/components/MobileBottomNav'

export const metadata: Metadata = {
  title: 'Mate — Find Your Perfect Roommate',
  description: 'Mate connects property owners and roommate seekers with intelligent matching, real-time messaging, and a beautiful browsing experience.',
  keywords: 'roommate finder, property listing, PG, flat share, house sharing India',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Mate — Find Your Perfect Roommate',
    description: 'Smart roommate matching platform for India',
    type: 'website',
    images: ['/logo.svg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('mate-theme');
                  if (storedTheme) {
                    document.documentElement.setAttribute('data-theme', storedTheme);
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}

