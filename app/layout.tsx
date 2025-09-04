import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import NavbarSwitcher from '@/components/navbar/NavbarSwitcher'
import CardNav from '@/components/common/CardNav'
import { Footer } from '@/components/common/Footer'
import { Web3Provider } from '@/components/providers/WagmiProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Auctra',
  description: 'Auction & marketplace for valuable expiring domains on Doma with transparent price discovery.',
  icons: {
    icon: '/images/logo/auctraLogo.png',
    shortcut: '/images/logo/auctraLogo.png',
    apple: '/images/logo/auctraLogo.png',
  },
}

const navItems = [
  {
    label: "Auctions",
    bgColor: "#0D0716",
    textColor: "#ffffff",
    links: [
      { label: "Explore Auctions", href: "/app/explore", ariaLabel: "View live domain auctions" },
      { label: "Create Auction", href: "/app/create", ariaLabel: "Create a new auction" },
    ]
  },
  {
    label: "Lending Protocol",
    bgColor: "#170D27",
    textColor: "#ffffff",
    links: [
      { label: "Earn & Borrow", href: "/app/supply-borrow", ariaLabel: "View earn and borrow options" },
      { label: "Create Oracle", href: "/app/oracle", ariaLabel: "Create Premium Domain" },
    ]
  },
  {
    label: "Renting Domain",
    bgColor: "#271E37",
    textColor: "#ffffff",
    links: [
      { label: "Explore Renting", href: "/app/rent", ariaLabel: "Explore Renting" },
      { label: "Create Renting", href: "/app/rent/create", ariaLabel: "Create Renting" },
      { label: "Manage Renting", href: "/app/rent/manage", ariaLabel: "Manage Renting" },
    ]
  }
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical routes */}
        <link rel="prefetch" href="/app/explore" />
        <link rel="prefetch" href="/app/dashboard" />
        <link rel="prefetch" href="/app/create" />
        <link rel="prefetch" href="/app/supply-borrow" />
        <link rel="prefetch" href="/app/rent" />
        <link rel="prefetch" href="/app/history" />
        
        {/* Preload API endpoints */}
        <link rel="prefetch" href="/api/auctions" />
        <link rel="prefetch" href="/api/domains" />
        
        {/* Preload images */}
        <link rel="preload" href="/images/logo/auctraLogo.png" as="image" />
        <link rel="preload" href="/images/logo/domaLogo.svg" as="image" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/components/ui/globe-data.json" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider>
          <Web3Provider>
            <div className="min-h-screen flex flex-col relative bg-white dark:bg-gray-900 transition-colors duration-300">
              <NavbarSwitcher 
                cardNavProps={{
                  logo: "/images/logo/auctraLogo.png",
                  logoAlt: "Auctra Logo",
                  items: navItems,
                  baseColor: "#16213e",
                  menuColor: "#ffffff",
                  buttonBgColor: "#3b82f6",
                  buttonTextColor: "#ffffff"
                }}
              />
              <main className="flex-1 pt-20">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}