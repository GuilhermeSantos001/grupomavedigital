import { Pako } from '@/core/libs/pako.lib';

export type Value = { [x: string]: unknown };

export class JsonEx {
  private readonly pako: Pako;

  constructor(private readonly maxDepth: number = 100) {
    this.pako = new Pako();
  }

  private _encode(value: Value, depth: number) {
    if (depth >= this.maxDepth) throw new Error('Object too deep');

    const type = Object.prototype.toString.call(value);

    if (type === '[object Object]' || type === '[object Array]') {
      const constructorName = value.constructor.name;

      if (constructorName !== 'Object' && constructorName !== 'Array') {
        value['@'] = constructorName;
      }

      for (const key of Object.keys(value)) {
        value[key] = this._encode(value[key] as Value, depth + 1);
      }
    }
    return value;
  }

  private _decode(value: string) {
    const type = Object.prototype.toString.call(value);
    const window = {};
    if (type === '[object Object]' || type === '[object Array]') {
      if (value['@']) {
        const constructor = window[value['@']];
        if (constructor) {
          Object.setPrototypeOf(value, constructor.prototype);
        }
      }
      for (const key of Object.keys(value)) {
        value[key] = this._decode(value[key]);
      }
    }
    return value;
  }

  public makeDeepCopy(object: Value) {
    return this.parse(this.stringify(object));
  }

  public stringify(value: Value) {
    return this.pako.compress(JSON.stringify(this._encode(value, 0)));
  }

  public parse(json: Uint8Array) {
    return this._decode(JSON.parse(this.pako.decompress(json)));
  }
}
