import { ERC721_METADATA_ABI } from "./erc721";
import { ipfsToHttp, decodeDataUriJson } from "./uri";

export type NftImageResult = {
  imageUrl: string | null;     // http(s) url or data: url
  imageType: "url" | "data" | null;
  rawMetadata?: any;
  tokenURI?: string | null;
};

export async function fetchNftImage(params: {
  client: any;
  nft: `0x${string}`;
  tokenId: bigint;
  ipfsGateway?: string;
}): Promise<NftImageResult> {
  const { client, nft, tokenId, ipfsGateway } = params;

  // 1) baca tokenURI dari kontrak
  const tokenURI = await client.readContract({
    address: nft,
    abi: ERC721_METADATA_ABI,
    functionName: "tokenURI",
    args: [tokenId],
  });

  let meta: any | null = null;

  console.log("🔍 TokenURI received:", tokenURI);

  // 2) kalau data:application/json, decode langsung
  meta = decodeDataUriJson(tokenURI);
  if (!meta) {
    // 3) kalau ipfs:// atau https://, fetch json melalui API proxy untuk mengatasi CORS
    const url = ipfsToHttp(tokenURI, ipfsGateway);
    console.log("🌐 Fetching metadata from URL:", url);
    
    try {
      // Gunakan API proxy untuk mengatasi CORS
      const proxyUrl = `/api/nft-metadata?tokenURI=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      
      if (!res.ok) {
        throw new Error(`Proxy request failed: ${res.status}`);
      }
      
      meta = await res.json();
    } catch (proxyError) {
      console.warn("Proxy request failed, trying direct fetch:", proxyError);
      // Fallback ke direct fetch (mungkin berhasil untuk beberapa URL)
      const res = await fetch(url);
      meta = await res.json();
    }
  }

  console.log("📋 Metadata received:", meta);

  // 4) ambil image - check berbagai kemungkinan field name
  let image = meta?.image || meta?.Image || meta?.image_url || meta?.imageUrl || null;

  // 5) khusus "image_data" (biasanya SVG inline), jadikan data URL
  if (!image && meta?.image_data) {
    const svg = String(meta.image_data);
    const dataUrl =
      "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    return {
      imageUrl: dataUrl,
      imageType: "data",
      rawMetadata: meta,
      tokenURI,
    };
  }

  // 6) normalisasi IPFS → HTTP
  if (image) image = ipfsToHttp(image, ipfsGateway);

  console.log("🖼️ Final image URL:", image);

  return {
    imageUrl: image,
    imageType: image?.startsWith("data:") ? "data" : image ? "url" : null,
    rawMetadata: meta,
    tokenURI,
  };
}