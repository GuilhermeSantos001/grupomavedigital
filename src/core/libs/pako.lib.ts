import { deflate, inflate } from 'pako';

export class Pako {
  public compress(json: string) {
    return deflate(json);
  }

  public decompress(compressed: Uint8Array) {
    return inflate(compressed, { to: 'string' });
  }
}
