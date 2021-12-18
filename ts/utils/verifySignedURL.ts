/**
 * @description Processa os dados da url assinada
 * @author @GuilhermeSantos001
 * @update 03/12/2021
 */

import { decode, verify } from "jsonwebtoken";
import { decompressFromBase64 } from "lz-string";

export default function verifySignedURL(signedUrl: string): boolean {
  try {
    if (verify(signedUrl, process.env.SIGNED_URL_SECRET || "")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = decode(signedUrl);

      if (!payload['security'])
        return false;

      const security = decompressFromBase64(payload['security']) || "";

      if (
        security.length <= 0 ||
        security.split('?key=')[0].length <= 0
      )
        return false

      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}