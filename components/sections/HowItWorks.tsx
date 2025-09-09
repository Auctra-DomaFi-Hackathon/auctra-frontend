import { Card, CardContent } from "@/components/ui/card";
import { Search, PlusCircle, Banknote, Repeat } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Explore Auction Domains",
      description:
        "Discover and participate in multiple auction formats — English, Dutch, or sealed-bid — all powered by transparent smart contracts.",
      step: "01",
    },
    {
      icon: PlusCircle,
      title: "Create Your Own Auction",
      description:
        "List your domain and launch a custom auction with flexible parameters, reaching a global pool of bidders.",
      step: "02",
    },
    {
      icon: Banknote,
      title: "Leverage Domains as Collateral",
      description:
        "Use your tokenized domain as collateral to borrow USDC or supply USDC to earn stable yields directly from the protocol.",
      step: "03",
    },
    {
      icon: Repeat,
      title: "Rent Domains Effortlessly",
      description:
        "Generate passive income by renting out your domains with secure on-chain agreements and automated payment flows.",
      step: "04",
    },
  ];

  return (
    <section className="py-20 bg-backgroundLight">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4 leading-tight">
            How It Works
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto leading-relaxed">
            Four simple steps to discover, bid, and own premium domains
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden rounded-2xl shadow-card hover:shadow-lg transition-shadow border-border"
              >
                <CardContent className="p-8">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
                    {step.step}
                  </div>

                  <div className="mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-textPrimary mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-textSecondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </CardContent>

                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border z-10"></div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
