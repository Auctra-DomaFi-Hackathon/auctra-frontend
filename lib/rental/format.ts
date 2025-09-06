import { Address } from "./types";

export function formatUSDC(amount: bigint): string {
  const formatted = Number(amount) / 1_000_000; // 6 decimals
  return formatted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function formatUSD(amount: bigint): string {
  const formatted = Number(amount) / 1_000_000; // 6 decimals
  
  // Handle very small amounts by showing more decimal places
  if (formatted > 0 && formatted < 0.01) {
    return `${formatted.toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    })}`;
  }
  
  return `${formatted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateWithTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeLeft(expiryTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = expiryTimestamp - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getDaysLeft(expiryTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  const diff = expiryTimestamp - now;
  return Math.max(0, Math.floor(diff / 86400));
}

export function parseUSDCInput(value: string): bigint {
  const cleanValue = value.replace(/[^0-9.]/g, '');
  const numValue = parseFloat(cleanValue);
  if (isNaN(numValue)) return BigInt(0);
  return BigInt(Math.floor(numValue * 1_000_000));
}