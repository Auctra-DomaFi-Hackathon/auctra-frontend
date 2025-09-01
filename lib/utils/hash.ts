import { keccak256 } from 'js-sha3'

export function createCommitHash(bidAmount: number, salt: string, bidderAddress: string): string {
  const data = `${bidAmount}${salt}${bidderAddress}`
  return '0x' + keccak256(data)
}

export function generateRandomSalt(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function verifyCommitHash(
  bidAmount: number,
  salt: string,
  bidderAddress: string,
  commitHash: string
): boolean {
  const computedHash = createCommitHash(bidAmount, salt, bidderAddress)
  return computedHash === commitHash
}