import { encodeAbiParameters } from "viem";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

export function buildEligibilityProofBytes(
  whitelist: string[],
  userAddress: string
): `0x${string}` {
  const leaves = whitelist.map((a) => keccak256(a.toLowerCase()));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const leaf = keccak256(userAddress.toLowerCase());
  const proofBuffers = tree.getProof(leaf).map((p) => p.data);
  const proofHexes = proofBuffers.map(
    (buf) => ("0x" + buf.toString("hex")) as `0x${string}`
  );

  // Strategy expect: bytes -> abi.encode(bytes32[])
  const eligibilityProofBytes = encodeAbiParameters(
    [{ type: "bytes32[]" }],
    [proofHexes]
  );
  return eligibilityProofBytes;
}

export function encodeProofBytes(proofHexes: `0x${string}`[]): `0x${string}` {
  return encodeAbiParameters([{ type: "bytes32[]" }], [proofHexes]);
}