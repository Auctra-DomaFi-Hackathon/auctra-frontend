"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMyDomains } from "@/lib/graphql/hooks";
import { useCreateRentalFlow } from "./useCreateRentalFlow";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Domain } from "@/types";

type Step = "domain" | "terms" | "preview";

export function useCreateRentingForm() {
  const [currentStep, setCurrentStep] = useState<Step>("domain");
  const [loading, setLoading] = useState(true); // Start with loading true for initial skeleton
  const [error, setError] = useState<string | null>(null);
  
  // Wallet and domains
  const { address } = useAccount();
  const {
    domains: graphqlDomains,
    loading: domainsLoading,
  } = useMyDomains(address);

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Show skeleton for 1.5 seconds on initial load

    return () => clearTimeout(timer);
  }, []);
  
  // Form data
  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [minDays, setMinDays] = useState("1");
  const [maxDays, setMaxDays] = useState("30");

  const rentalFlow = useCreateRentalFlow();
  const { toast } = useToast();
  const router = useRouter();

  // Transform GraphQL domains to Domain format
  const domains = useMemo((): Domain[] => {
    if (graphqlDomains && graphqlDomains.length > 0) {
      return graphqlDomains.map((domain, index) => ({
        id: `domain-${index}`,
        name: domain.name,
        expiresAt: domain.expiresAt,
        verified: true,
        tokenAddress: domain.tokenAddress,
        tokenId: domain.tokenId,
        tokenChain: domain.tokenChain,
      }));
    }
    return []
  }, [graphqlDomains])

  // Handle rental flow completion
  useEffect(() => {
    if (rentalFlow.isCompleted) {
      toast({
        title: "Success!",
        description: `Your rental listing has been created successfully! Listing ID: ${rentalFlow.listingId}`,
      });
      
      // Redirect to manage page after a short delay
      setTimeout(() => {
        router.push("/app/rent/manage");
      }, 2000);
    }
  }, [rentalFlow.isCompleted, rentalFlow.listingId, toast, router]);

  // Handle rental flow errors
  useEffect(() => {
    if (rentalFlow.hasError) {
      setError(rentalFlow.error);
      setLoading(false);
    }
  }, [rentalFlow.hasError, rentalFlow.error]);

  // Flow continuation is now handled automatically in useCreateRentalFlow
  // This useEffect is no longer needed but kept commented for reference
  // useEffect(() => {
  //   if (rentalFlow.isInProgress && !rentalFlow.isPending && !rentalFlow.isConfirming) {
  //     rentalFlow.continueFlow({
  //       nftAddress,
  //       tokenId,
  //       pricePerDay,
  //       securityDeposit,
  //       minDays: parseInt(minDays),
  //       maxDays: parseInt(maxDays),
  //     });
  //   }
  // }, [rentalFlow, nftAddress, tokenId, pricePerDay, securityDeposit, minDays, maxDays]);

  // Handle domain selection
  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomainId(domain.id);
    setNftAddress(domain.tokenAddress || '');
    setTokenId(domain.tokenId || '');
    setError(null);
  };

  const steps = [
    {
      id: "domain" as const,
      title: "NFT Details",
      description: "Enter domain NFT info",
    },
    {
      id: "terms" as const,
      title: "Set Terms",
      description: "Configure pricing",
    },
    {
      id: "preview" as const,
      title: "Review",
      description: "Create listing",
    },
  ];

  const handleDomainNext = async () => {
    if (!nftAddress || !tokenId) {
      setError("Please fill in all required fields");
      return;
    }

    setError(null);
    setCurrentStep("terms");
  };

  const handleTermsNext = () => {
    if (!pricePerDay || !securityDeposit || !minDays || !maxDays) {
      setError("Please fill in all pricing fields");
      return;
    }

    const minDaysNum = parseInt(minDays);
    const maxDaysNum = parseInt(maxDays);

    if (minDaysNum < 1) {
      setError("Minimum days must be at least 1");
      return;
    }

    if (maxDaysNum < minDaysNum) {
      setError("Maximum days must be greater than or equal to minimum days");
      return;
    }

    setError(null);
    setCurrentStep("preview");
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await rentalFlow.startFlow({
        nftAddress,
        tokenId,
        pricePerDay,
        securityDeposit,
        minDays: parseInt(minDays),
        maxDays: parseInt(maxDays),
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "terms") {
      setCurrentStep("domain");
    } else if (currentStep === "preview") {
      setCurrentStep("terms");
    }
    setError(null);
  };

  // Step props
  const domainStepProps = {
    nftAddress,
    tokenId,
    selectedDomainId,
    domains,
    onDomainSelect: handleDomainSelect,
    onNext: handleDomainNext,
    loading: loading || domainsLoading,
    error,
  };

  const termsStepProps = {
    pricePerDay,
    securityDeposit,
    minDays,
    maxDays,
    onPricePerDayChange: setPricePerDay,
    onSecurityDepositChange: setSecurityDeposit,
    onMinDaysChange: setMinDays,
    onMaxDaysChange: setMaxDays,
    onBack: handleBack,
    onNext: handleTermsNext,
    loading,
    error,
  };

  const previewStepProps = {
    nftAddress,
    tokenId,
    pricePerDay,
    securityDeposit,
    minDays,
    maxDays,
    onBack: handleBack,
    onSubmit: handleSubmit, // Step 1: Approve NFT
    onCreateRental: rentalFlow.createRental, // Step 2: Create Rental
    onSetTerms: rentalFlow.setTerms, // Step 3: Set Terms
    loading: loading || rentalFlow.isInProgress,
    error: error || rentalFlow.error,
    flowStep: rentalFlow.currentStep,
    flowDescription: rentalFlow.getStepDescription(),
    isPending: rentalFlow.isPending,
    isConfirming: rentalFlow.isConfirming,
    hash: rentalFlow.hash,
    isCompleted: rentalFlow.isCompleted,
    listingId: rentalFlow.listingId,
    getCurrentStepNumber: rentalFlow.getCurrentStepNumber,
    canExecuteStep: rentalFlow.canExecuteStep,
  };

  const stepperProps = {
    currentStep,
    steps,
  };

  return {
    currentStep,
    setCurrentStep,
    loading,
    stepperProps,
    domainStepProps,
    termsStepProps,
    previewStepProps,
  };
}