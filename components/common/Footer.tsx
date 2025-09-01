import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/status" className="hover:text-foreground transition-colors">
              Status
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms & Conditions
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2025 Auctra. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}