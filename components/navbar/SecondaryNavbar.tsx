"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { domaTestnet } from "@/lib/config/wagmi";

export default function SecondaryNavbar() {
  const pathname = usePathname();
  const { address, isConnected, connector, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [hoverTimeouts, setHoverTimeouts] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [hoveredDropdown, setHoveredDropdown] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const dropdownOpeningRef = useRef<boolean>(false);

  // Get balance from Doma Testnet (only when connected and on correct chain)
  const { data: balance } = useBalance({
    address: address,
    chainId: domaTestnet.id,
    query: {
      enabled: isConnected && chain?.id === domaTestnet.id,
    },
  });

  const logo = "/images/logo/auctraLogo.png";
  const logoAlt = "Auctra Logo";

  const navItems = [
    { label: "Dashboard", href: "/app/dashboard" },
    {
      label: "Auction",
      items: [
        { label: "Explore", href: "/app/explore" },
        { label: "Create Auction", href: "/app/create" },
      ],
    },
    {
      label: "Lending",
      items: [
        { label: "Earn & Borrow", href: "/app/supply-borrow" },
        { label: "Oracle Setup", href: "/app/oracle" },
      ],
    },
    {
      label: "Renting",
      items: [
        { label: "Explore Renting", href: "/app/rent" },
        { label: "Create Renting", href: "/app/rent/create" },
        { label: "Manage Renting", href: "/app/rent/manage" },
      ],
    },
    { label: "History", href: "/app/history" },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: any) => {
    if (!balance) return "0.000";
    const formatted = parseFloat(balance.formatted);
    return formatted.toFixed(3);
  };

  const handleConnect = async (connector: any) => {
    try {
      console.log('Attempting to connect with:', connector.name, connector);
      setIsConnecting(true);
      
      // Connect to wallet with specific chain ID
      connect({ 
        connector,
        chainId: domaTestnet.id
      });
      setIsConnectModalOpen(false);
      
      // Note: Network switching will be handled in useEffect after connection
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
      setIsConnectModalOpen(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const getWalletIcon = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes("rabby")) return "🐰";
    if (name.includes("metamask")) return "🦊";
    if (name.includes("rainbow")) return "🌈";
    if (name.includes("brave")) return "🦁";
    return "💼";
  };

  // Filter connectors to remove duplicates and only show unique wallets
  const getUniqueConnectors = () => {
    const seen = new Set();
    const uniqueConnectors = [];
    const priorityConnectors = [];
    const otherConnectors = [];

    for (const connector of connectors) {
      const name = connector.name.toLowerCase();

      // Skip Safe, Coinbase, and WalletConnect wallets
      if (name.includes("safe") || name.includes("coinbase") || name.includes("walletconnect")) {
        continue;
      }

      // Create a key for grouping similar connectors
      let key = name;
      if (name.includes("metamask")) {
        key = "metamask";
      } else if (name.includes("rainbow")) {
        key = "rainbow";
      } else if (name.includes("rabby")) {
        key = "rabby";
      } else if (name.includes("brave")) {
        key = "brave";
      }

      if (!seen.has(key)) {
        seen.add(key);

        // Prioritize MetaMask and Rabby
        if (name.includes("metamask") || name.includes("rabby")) {
          priorityConnectors.push(connector);
        } else {
          otherConnectors.push(connector);
        }
      }
    }

    // Sort priority connectors: MetaMask first, then Rabby
    priorityConnectors.sort((a, b) => {
      if (a.name.toLowerCase().includes("metamask")) return -1;
      if (b.name.toLowerCase().includes("metamask")) return 1;
      if (a.name.toLowerCase().includes("rabby")) return -1;
      if (b.name.toLowerCase().includes("rabby")) return 1;
      return 0;
    });

    return [...priorityConnectors, ...otherConnectors];
  };

  // Helper functions for hover delays
  const handleDropdownEnter = (index: number) => {
    // Prevent double execution
    if (dropdownOpeningRef.current) return;
    dropdownOpeningRef.current = true;
    
    // Clear any existing timeout for this dropdown
    const key = `dropdown-${index}`;
    if (hoverTimeouts[key]) {
      clearTimeout(hoverTimeouts[key]);
      setHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[key];
        return newTimeouts;
      });
    }
    
    // Only set if not already open to prevent duplicate triggers
    if (openDropdownIndex !== index) {
      setHoveredDropdown(index);
      setOpenDropdownIndex(index);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      dropdownOpeningRef.current = false;
    }, 50);
  };

  const handleDropdownLeave = (index: number) => {
    const key = `dropdown-${index}`;
    const timeoutId = setTimeout(() => {
      setOpenDropdownIndex(prev => prev === index ? null : prev);
    }, 200); // Increased delay
    
    setHoverTimeouts(prev => ({
      ...prev,
      [key]: timeoutId
    }));
  };

  const handleDropdownContentEnter = (index: number) => {
    // Clear timeout when entering dropdown content - don't set dropdown again
    const key = `dropdown-${index}`;
    if (hoverTimeouts[key]) {
      clearTimeout(hoverTimeouts[key]);
      setHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[key];
        return newTimeouts;
      });
    }
    // Don't call setOpenDropdownIndex here as it's already open
    setHoveredDropdown(index);
  };

  const handleDropdownContentLeave = (index: number) => {
    const key = `dropdown-${index}`;
    const timeoutId = setTimeout(() => {
      setOpenDropdownIndex(prev => prev === index ? null : prev);
    }, 200); // Increased delay
    
    setHoverTimeouts(prev => ({
      ...prev,
      [key]: timeoutId
    }));
  };

  const handleWalletEnter = () => {
    if (hoverTimeouts.wallet) {
      clearTimeout(hoverTimeouts.wallet);
      setHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts.wallet;
        return newTimeouts;
      });
    }
    setIsDropdownOpen(true);
  };

  const handleWalletLeave = () => {
    const timeoutId = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 100); // 100ms delay
    
    setHoverTimeouts(prev => ({
      ...prev,
      wallet: timeoutId
    }));
  };

  const handleConnectEnter = () => {
    if (hoverTimeouts.connect) {
      clearTimeout(hoverTimeouts.connect);
      setHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts.connect;
        return newTimeouts;
      });
    }
    setIsConnectModalOpen(true);
  };

  const handleConnectLeave = () => {
    const timeoutId = setTimeout(() => {
      setIsConnectModalOpen(false);
    }, 100); // 100ms delay
    
    setHoverTimeouts(prev => ({
      ...prev,
      connect: timeoutId
    }));
  };

  // Handle connection state changes and network switching
  useEffect(() => {
    if (isConnected && isConnecting) {
      console.log('Successfully connected to wallet');
      console.log('Current chain:', chain);
      console.log('Target chain:', domaTestnet);
      
      // Always attempt to switch to Doma Testnet after connection
      if (!chain || chain.id !== domaTestnet.id) {
        console.log('Network switch needed, initiating switch to Doma Testnet...');
        try {
          switchChain({ chainId: domaTestnet.id });
          console.log('Network switch initiated');
          // Don't set isConnecting to false here, wait for switch completion
        } catch (error: any) {
          console.error('Failed to initiate network switch:', error);
          setIsConnecting(false);
        }
      } else {
        console.log('Already on Doma Testnet');
        setIsConnecting(false);
      }
      
      setIsConnectModalOpen(false);
    }
  }, [isConnected, isConnecting, chain, switchChain]);

  // Handle network switch completion
  useEffect(() => {
    if (isConnected && !isSwitchingChain && chain?.id === domaTestnet.id) {
      console.log('Network switch completed successfully');
      setIsConnecting(false);
    }
  }, [isConnected, isSwitchingChain, chain]);

  // Auto-switch to Doma Testnet if connected but on wrong network
  useEffect(() => {
    if (isConnected && !isConnecting && !isSwitchingChain && chain && chain.id !== domaTestnet.id) {
      console.log('User connected but on wrong network, auto-switching to Doma Testnet...');
      try {
        switchChain({ chainId: domaTestnet.id });
      } catch (error: any) {
        console.error('Failed to auto-switch network:', error);
      }
    }
  }, [isConnected, isConnecting, isSwitchingChain, chain, switchChain]);

  // Handle connection errors
  useEffect(() => {
    if (!isPending && !isSwitchingChain && isConnecting) {
      // If not pending and we were connecting, connection might have failed
      const timer = setTimeout(() => {
        setIsConnecting(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPending, isSwitchingChain, isConnecting]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(hoverTimeouts).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, [hoverTimeouts]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <Link href="/app/explore" className="flex items-center space-x-2">
            <Image
              src={logo}
              alt={logoAlt}
              width={28}
              height={28}
              className="logo"
            />
            <div className="text-xl font-medium text-black">Auctra</div>
          </Link>

          <div className="hidden md:flex items-center space-x-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                // Check if item has dropdown items
                if ('items' in item && item.items) {
                  // Check if any dropdown item is active
                  const isActive = item.items.some(subItem => pathname === subItem.href);
                  
                  const itemIndex = navItems.findIndex(navItem => navItem.label === item.label);
                  
                  return (
                    <div
                      key={item.label}
                      onMouseEnter={() => handleDropdownEnter(itemIndex)}
                      onMouseLeave={() => handleDropdownLeave(itemIndex)}
                      className="relative"
                    >
                      <DropdownMenu open={openDropdownIndex === itemIndex}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            )}
                          >
                            {item.label}
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="center" 
                          className="w-48"
                          onMouseEnter={() => handleDropdownContentEnter(itemIndex)}
                          onMouseLeave={() => handleDropdownContentLeave(itemIndex)}
                        >
                          {item.items.map((subItem) => (
                            <DropdownMenuItem key={subItem.href} asChild>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "w-full text-sm cursor-pointer",
                                  pathname === subItem.href
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:text-blue-600"
                                )}
                              >
                                {subItem.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                } else if ('href' in item && item.href) {
                  // Regular single link item
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Right Actions - Minimal */}
          <div className="flex items-center space-x-3">
            {/* Chain Indicator */}
            {isConnected && (
              <div className="flex items-center">
                {chain && chain.id !== domaTestnet.id ? (
                  <div 
                    className={`flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg transition-colors ${
                      isSwitchingChain 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer hover:bg-red-100'
                    }`}
                    onClick={() => !isSwitchingChain && switchChain({ chainId: domaTestnet.id })}
                    title={isSwitchingChain ? "Switching network..." : "Click to switch to Doma Testnet"}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-700">
                      {isSwitchingChain ? 'Switching...' : 'Wrong Network'}
                    </span>
                    {!isSwitchingChain && (
                      <span className="text-xs text-red-500">
                        ({chain.name})
                      </span>
                    )}
                  </div>
                ) : chain ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <Image
                      src="/images/logo/domaLogo.svg"
                      alt="Doma Testnet"
                      width={60}
                      height={16}
                      className="rounded-sm"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">
                      Unknown Network
                    </span>
                  </div>
                )}
              </div>
            )}
            {/* Custom Wallet Connect */}
            {isConnected ? (
              <div 
                className="relative wallet-dropdown-container"
                onMouseEnter={handleWalletEnter}
                onMouseLeave={handleWalletLeave}
              >
                {/* Check if on wrong network */}
                {chain && chain.id !== domaTestnet.id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 hover:text-red-500 bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-2 min-w-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                      switchChain({ chainId: domaTestnet.id });
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex flex-col items-start text-xs">
                      <span className="font-medium hover:text-red-500">
                        Wrong Network
                      </span>
                      <span className="text-red-600 text-[10px]">
                        Click to switch
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 hover:text-red-500" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 hover:text-green-500 bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-2 min-w-fit"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex flex-col items-start text-xs">
                      <span className="font-medium hover:text-green-500">
                        {formatAddress(address!)}
                      </span>
                      <span className="text-green-600">
                        {formatBalance(balance)} ETH
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 hover:text-green-500" />
                  </Button>
                )}

                {/* Wallet Dropdown */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-[60]"
                    onMouseEnter={handleWalletEnter}
                    onMouseLeave={handleWalletLeave}
                  >
                    {/* Header */}
                    <div className={`p-4 border-b border-gray-100 ${
                      chain && chain.id !== domaTestnet.id 
                        ? 'bg-gradient-to-r from-red-50 to-orange-50' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${
                          chain && chain.id !== domaTestnet.id 
                            ? 'bg-red-100' 
                            : 'bg-blue-100'
                        } rounded-full flex items-center justify-center`}>
                          {chain && chain.id !== domaTestnet.id ? (
                            <span className="text-lg">⚠️</span>
                          ) : (
                            <Image
                              src="/images/logo/domaLogo.svg"
                              alt="Doma Testnet"
                              width={20}
                              height={20}
                              className="rounded-sm"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {connector?.name}
                          </p>
                          <p className={`text-xs ${
                            chain && chain.id !== domaTestnet.id 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                          }`}>
                            {chain && chain.id !== domaTestnet.id 
                              ? `Wrong Network: ${chain.name}` 
                              : 'Connected to Doma Testnet'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Switch Network Button for Wrong Network */}
                      {chain && chain.id !== domaTestnet.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            switchChain({ chainId: domaTestnet.id });
                          }}
                          className="mt-3 w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors font-medium"
                          disabled={isSwitchingChain}
                        >
                          {isSwitchingChain ? 'Switching...' : 'Switch to Doma Testnet'}
                        </button>
                      )}
                    </div>

                    {/* Balance Section */}
                    <div className="p-4 border-b border-gray-100">
                      {chain && chain.id !== domaTestnet.id ? (
                        <div className="text-center py-2">
                          <div className="text-sm text-red-600 font-medium mb-1">
                            ⚠️ Wrong Network Detected
                          </div>
                          <div className="text-xs text-gray-500">
                            Please switch to Doma Testnet to see your balance
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Balance</span>
                            <div className="flex items-center gap-2">
                              <Image
                                src="/images/logo/domaLogo.svg"
                                alt="Doma Testnet"
                                width={50}
                                height={16}
                                className="rounded-full"
                              />
                              <span className="text-sm font-medium">
                                {formatBalance(balance)} ETH
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">Doma Testnet</div>
                        </>
                      )}
                    </div>

                    {/* Address Section */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Wallet Address
                          </p>
                          <p className="text-xs text-gray-500 font-mono break-all">
                            {address}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAddress();
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-blue-50 rounded transition-colors"
                            title={copiedAddress ? "Copied!" : "Copy address"}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `${domaTestnet.blockExplorers.default.url}/address/${address}`,
                                "_blank"
                              );
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-blue-50 rounded transition-colors"
                            title="View on explorer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisconnect();
                        }}
                        className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="relative connect-modal-container"
                onMouseEnter={handleConnectEnter}
                onMouseLeave={handleConnectLeave}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2 hover:text-blue-500"
                  disabled={isPending || isConnecting || isSwitchingChain}
                >
                  <Wallet className="w-4 h-4" />
                  {isPending 
                    ? "Connecting..." 
                    : isSwitchingChain || (isConnecting && isConnected)
                    ? "Switching Network..."
                    : "Connect Wallet"
                  }
                </Button>

                {/* Connect Wallet Modal */}
                {isConnectModalOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-[60]"
                    onMouseEnter={handleConnectEnter}
                    onMouseLeave={handleConnectLeave}
                  >
                    {/* Header */}
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900">
                        Connect Wallet
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Choose your wallet
                      </p>
                    </div>

                    {/* Wallet List */}
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                      {getUniqueConnectors().map((connector) => (
                        <button
                          key={connector.uid}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(connector);
                          }}
                          disabled={isPending || isConnecting || isSwitchingChain}
                          className="w-full flex items-center gap-3 p-2.5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-xl">
                            {getWalletIcon(connector.name)}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {connector.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {connector.name.includes("MetaMask") &&
                                "Popular wallet for Web3"}
                              {connector.name.includes("Rainbow") &&
                                "Rainbow Wallet"}
                              {connector.name.includes("Rabby") &&
                                "Multi-chain wallet"}
                              {connector.name.includes("Brave") &&
                                "Built-in browser wallet"}
                              {!connector.name.includes("MetaMask") &&
                                !connector.name.includes("Rainbow") &&
                                !connector.name.includes("Rabby") &&
                                !connector.name.includes("Brave") &&
                                "Web3 Wallet"}
                            </p>
                          </div>
                          <ChevronDown className="w-3 h-3 text-gray-400 rotate-[-90deg]" />
                        </button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-xs text-gray-500">
                          Connect to Doma Testnet
                        </p>
                        <Image
                          src="/images/logo/domaLogo.svg"
                          alt="Doma Testnet"
                          width={50}
                          height={16}
                          className="rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}
