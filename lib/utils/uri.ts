export function ipfsToHttp(uri: string, gateway = "https://ipfs.io/ipfs/"): string {
  if (!uri) return uri;
  if (uri.startsWith("ipfs://")) {
    return gateway + uri.replace("ipfs://", "");
  }
  return uri;
}

export function decodeDataUriJson(uri: string): any | null {
  // data:application/json;base64,....
  if (!uri?.startsWith("data:")) return null;
  const [, b64] = uri.split("base64,");
  if (!b64) return null;
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json);
}