import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { HyperText } from "@/components/magicui/hyper-text";
import { SparklesText } from "@/components/magicui/sparkles-text";
import LogoLoop from "@/components/magicui/logo-loop";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiEthereum,
  SiSolidity,
} from "react-icons/si";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const techLogos = [
    {
      node: <SiReact className="text-blue-500" />,
      title: "React",
      href: "https://react.dev",
    },
    {
      node: <SiNextdotjs className="text-black dark:text-white" />,
      title: "Next.js",
      href: "https://nextjs.org",
    },
    {
      node: <SiTypescript className="text-blue-600" />,
      title: "TypeScript",
      href: "https://www.typescriptlang.org",
    },
    {
      node: <SiTailwindcss className="text-cyan-500" />,
      title: "Tailwind CSS",
      href: "https://tailwindcss.com",
    },
    {
      node: <SiEthereum className="text-purple-600" />,
      title: "Ethereum",
      href: "https://ethereum.org",
    },
    {
      node: <SiSolidity className="text-gray-700" />,
      title: "Solidity",
      href: "https://soliditylang.org",
    },
  ];

  const imageLogos = [
    {
      src: "/images/logo/domaLogo.svg",
      alt: "Doma Logo",
      href: "https://doma.com",
    },
    {
      src: "/images/logo/d3Logo.png",
      alt: "D3 Logo",
      href: "https://d3js.org",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center py-20 sm:py-32 lg:py-40 relative z-20 max-w-7xl">
          {/* Main Heading - Responsive Typography */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 sm:mb-8 lg:mb-12 text-gray-900 leading-[1.1] sm:leading-tight">
            <span className="block text-gray-900 mb-2">Redefine DeFi with</span>
            <span className="block text-gradient bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent">
              <HyperText
                className="inline font-inherit text-inherit"
                duration={1000}
                delay={500}
                startOnView={true}
              >
                Auctra
              </HyperText>
            </span>
          </h1>

          {/* Subtitle - Improved Spacing and Typography */}
          <div className="mb-8 sm:mb-12 lg:mb-16 max-w-2xl lg:max-w-4xl mx-auto z-[10rem]">
            <div className="text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium text-black/70">
              <span className="text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium text-black/70">
                Bid, acquire, rent and leverage your domains as collateral to
                access new DeFi opportunities on {}
              </span>
              <SparklesText
                className="inline text-lg sm:text-xl lg:text-2xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-blue-600"
                colors={{ first: "#3B82F6", second: "#8B5CF6" }}
                sparklesCount={3}
              >
                Doma Network
              </SparklesText>
              <span className="text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium text-black/70">
                .
              </span>
            </div>
          </div>

          {/* CTA Buttons - Better Mobile Layout */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl focus-ring bg-primary hover:bg-primaryDark text-white font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              asChild
            >
              <Link href="/app/explore" target="_blank">
                Launch App
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl focus-ring border-2 border-primary text-primary hover:text-primary hover:bg-primary/5 font-bold transition-all duration-200 hover:scale-105"
              asChild
            >
              <Link href="/app/explore" target="_blank">
                Explore Auctions
              </Link>
            </Button>
          </div>

          {/* Partner Logos - Improved Mobile Layout */}
          <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <p className="text-gray-600 font-medium text-sm sm:text-base tracking-wide">
                  Built in
                </p>
                <div
                  className="w-2 h-2 bg-accent rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            </div>

            {/* Partner Logos Loop - Better Mobile Experience */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative px-4 sm:px-6 py-3 sm:py-4 bg-black/5 backdrop-blur-md rounded-2xl">
                <div
                  style={{
                    height: "50px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <LogoLoop
                    logos={imageLogos}
                    speed={30}
                    direction="right"
                    logoHeight={40}
                    gap={80}
                    pauseOnHover
                    scaleOnHover
                    ariaLabel="Partner logos"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <RetroGrid
          className="opacity-30"
          speed={1.5}
          animated={true}
          cellSize={40}
        />
      </div>
    </section>
  );
}
