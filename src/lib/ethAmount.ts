// src/lib/ethAmount.ts
import { parseEther } from "viem";

export function normalizeDecimal(input: string) {
  return input.replace(',', '.').trim();
}

export function toWeiFromEtherStr(etherStr: string): bigint {
  return parseEther(normalizeDecimal(etherStr));
}