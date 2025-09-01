'use client'

import { usePathname } from 'next/navigation'
import CardNav from '@/components/common/CardNav'
import SecondaryNavbar from './SecondaryNavbar'

interface NavbarSwitcherProps {
  cardNavProps: {
    logo: string
    logoAlt: string
    items: any[]
    baseColor: string
    menuColor: string
    buttonBgColor: string
    buttonTextColor: string
  }
}

export default function NavbarSwitcher({ cardNavProps }: NavbarSwitcherProps) {
  const pathname = usePathname()

  // Determine which navbar to show based on route pattern from JSON spec
  if (pathname === '/') {
    return <CardNav {...cardNavProps} />
  } else if (pathname.startsWith('/app/auction/')) {
    return <SecondaryNavbar />
  } else if (pathname.startsWith('/app')) {
    return <SecondaryNavbar />
  }

  // Default to CardNav for marketing pages
  return <CardNav {...cardNavProps} />
}