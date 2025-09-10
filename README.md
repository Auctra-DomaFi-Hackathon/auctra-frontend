# Auctra - Premium Domain Auctions

Auctra is a decentralized auction platform for premium and expiring domains on the Doma network, featuring transparent price discovery through Dutch and sealed-bid auctions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation & Development

```bash
# Clone the repository
git clone <repository-url>
cd auctra

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server with Turbopack
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm lint
```

## 🏗️ Project Structure

```
auctra/
├── app/                    # Next.js 14 App Router
│   ├── (public)/          # Public routes (home, auctions, domains)
│   ├── api/               # API route handlers (mock data)
│   ├── globals.css        # Global styles and theme
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   └── common/            # Shared components (Header, Footer, Hero)
├── features/              # Feature-based components
│   ├── auction/           # Auction-related components
│   ├── domain/            # Domain-related components
│   ├── marketplace/       # Secondary market components
│   ├── portfolio/         # User portfolio components
│   └── alerts/            # Notification components
├── lib/
│   ├── services/          # API clients and data fetching
│   ├── store/             # Jotai state management
│   └── utils/             # Utility functions
├── types/                 # TypeScript type definitions
├── mocks/                 # Mock data for development
└── tests/                 # Test files
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Jotai
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge, js-sha3

## 🎨 Modern DeFi Design System

The application features a premium blue and white theme with modern DeFi aesthetics:

### Design Language
- **Large bold headlines** with tight leading and oversized typography
- **Minimalist backgrounds** with subtle gradients and animated patterns
- **Rounded containers** (2xl) with soft shadows and modern spacing
- **Contrast sections** alternating between light and dark themes

### Colors
- **Primary**: `#2F6DF6` (Blue)
- **Primary Dark**: `#1E4FD1`
- **Accent**: `#6BA7FF`
- **Background Light**: `#FFFFFF`
- **Background Alt**: `#F8FAFF`
- **Text Primary**: `#0B1221`
- **Text Secondary**: `#51607A`

### Components
- **WarpBackground**: Animated 3D grid background with floating beams
- **WobbleCard**: Interactive cards with subtle motion effects
- **Rounded buttons** (xl) with bold typography
- **Feature cards** with icon + title + description layout

### Typography
- **Display**: `text-5xl md:text-7xl font-semibold tracking-tight`
- **H1**: `text-4xl md:text-5xl font-semibold`
- **H2**: `text-3xl font-semibold`
- **Body**: `text-base leading-relaxed`

### Layout
- **Cards**: `rounded-2xl` with soft shadows
- **Radius**: `lg: 1.25rem`, `xl: 1.5rem`, `2xl: 2rem`

## 🏁 Features Implemented

### ✅ Core Features
- Dutch auction system with real-time price updates
- Domain discovery and filtering
- Mock API endpoints with service layer
- Responsive design with blue/white theme
- State management for user, alerts, and bids
- Countdown timers with accessibility support
- Toast notifications

### ✅ Components
- AuctionCard with price display and countdown
- DomainCard with watchlist functionality  
- BidDrawer for placing bids (Dutch auctions)
- Hero section with gradient backgrounds
- Header with search and notification bell
- Countdown component with proper ARIA labels

### ✅ Pages
- **Home page**: Domain discovery and live auctions with search and filtering
- **Explore Auctions**: Browse all active Dutch and sealed-bid auctions with advanced filtering
- **Create Auction**: Interface for domain owners to list domains for auction
- **Auction Detail**: Comprehensive bidding interface with real-time price updates
- **Supply Domain as Collateral**: Deposit domain NFTs to use as collateral for borrowing
- **Borrow USDC**: Lending interface to borrow USDC against domain collateral
- **Domain Renting**: Marketplace for renting domains with flexible terms
- **Create Domain Rental**: List domains for rent with custom pricing and duration
- **History**: Complete transaction history including auctions, loans, and rentals
- **Alert Domains**: Notification center for domain alerts and watchlist management

### 🚧 Partially Implemented
- Sealed-bid auction UI (skeleton views created)
- Portfolio, alerts, and marketplace pages (routing prepared)
- Admin interface (basic structure)

### ⏳ Planned Features
- Complete sealed-bid auction flow with commit/reveal
- Portfolio management with holdings and bid history
- Alert center with notification management
- Secondary marketplace with orderbook
- Admin panel for auction management
- Enhanced analytics and domain metrics

## 🧪 Testing

The project includes unit tests for key components:

- **AuctionCard**: Tests rendering of auction data and pricing
- **Countdown**: Tests timer functionality with mocked timers

Run tests with: `pnpm test`

## 🔒 Security & Accessibility

- All form inputs include focus management
- ARIA labels on interactive elements
- Semantic HTML structure
- Mock commitment hashing for sealed bids (using keccak256)
- No real cryptocurrency integrations (mock only)

## 📱 Browser Support

- Modern browsers supporting ES2020+
- Mobile responsive design
- Keyboard navigation support

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# Doma API
NEXT_PUBLIC_DOMA_API_KEY=
NEXT_PUBLIC_LISTINGS_GRAPHQL_ENDPOINT=

# Contract Addresses - Core
NEXT_PUBLIC_FEE_MANAGER_CONTRACT_ADDRESS=
NEXT_PUBLIC_REGISTRAR_BRIDGE_CONTRACT_ADDRESS=

# Contract Addresses - Auctions
NEXT_PUBLIC_ENGLISH_AUCTION_CONTRACT_ADDRESS=
NEXT_PUBLIC_DUTCH_AUCTION_CONTRACT_ADDRESS=
NEXT_PUBLIC_SEALED_BID_AUCTION_CONTRACT_ADDRESS=
NEXT_PUBLIC_DOMAIN_AUCTION_HOUSE_CONTRACT_ADDRESS=

# Contract Addresses - Tokens & Services
NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ADDRESS=
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=
NEXT_PUBLIC_DOMAIN_LENDING_POOL=
NEXT_PUBLIC_MOCK_DOMAIN_ORACLE=
NEXT_PUBLIC_DOMAIN_RENTAL_VAULT=
NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS=
```

## 🤝 Development

### Adding New Features

1. Create components in the appropriate `features/` directory
2. Add API endpoints in `app/api/` if needed
3. Update mock data in `mocks/data.ts`
4. Add types in `types/` directory
5. Write tests in `tests/` directory

### Code Style

The project uses ESLint and Prettier for code formatting. Run `pnpm lint` to check for issues.

### State Management

Using Jotai for atomic state management:
- User state: authentication, watchlist, preferences
- Alerts state: notifications, read status
- Bids state: pending bids before blockchain submission
- Domain state: rental information, collateral data
- Auction state: bid history, sealed bid commitments

## 📝 License

This project is part of a development exercise and is not intended for production use with real cryptocurrency or domain transactions.
