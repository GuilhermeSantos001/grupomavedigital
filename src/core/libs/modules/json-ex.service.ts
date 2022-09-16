import { Injectable } from '@nestjs/common';

import type { Value } from '@/core/libs/json-ex.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

@Injectable()
export class JsonExService {
  private readonly jsonEx: JsonEx;

  constructor() {
    this.jsonEx = new JsonEx();
  }

  get method() {
    return this.jsonEx;
  }

  public makeDeepCopy(object: Value) {
    return this.jsonEx.makeDeepCopy(object);
  }

  public stringify(value: Value) {
    return this.jsonEx.stringify(value);
  }

  public parse(json: Uint8Array) {
    return this.jsonEx.parse(json);
  }
}
