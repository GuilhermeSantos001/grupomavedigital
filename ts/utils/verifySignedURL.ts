/**
 * @description Processa os dados da url assinada
 * @author GuilhermeSantos001
 * @update 24/01/2022
 */

import { decode, verify } from "jsonwebtoken";
import { decompressFromBase64 } from "lz-string";

export default function verifySignedURL(signedUrl: string): boolean {
  try {
    if (verify(signedUrl, process.env.SIGNED_URL_SECRET || "")) {
      const payload = decode(signedUrl);

      if (payload && typeof payload !== "string") {
        if (!payload['security'])
          return false;

        const security = decompressFromBase64(payload['security']) || "";

        if (
          security.length <= 0 ||
          security.split('?key=')[0].length <= 0
        )
          return false
      }

      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}