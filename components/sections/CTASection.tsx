import { Button } from '@/components/ui/button'
import { WarpBackground } from '@/components/magicui/warp-background'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-20 bg-backgroundAlt">
      <div className="container mx-auto px-4">
        <WarpBackground className="rounded-2xl bg-gradient-to-r from-primary to-primaryDark border-0 p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of domain investors discovering premium opportunities through transparent auctions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 rounded-xl bg-white text-black hover:bg-white/90" asChild>
              <Link href="/app/explore" target='_blank'>Get Started Now</Link>
            </Button>
          </div>
        </WarpBackground>
      </div>
    </section>
  )
}