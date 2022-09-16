import { Crypto, Encrypted } from '@/core/libs/crypto.lib';
import { StringEx } from '@/core/utils/string-ex.util';
import { Random } from '@/core/utils/random.util';

import { RecursivePartial } from '@/core/common/types/recursive-partial.type';
import { SimilarityType } from '@/core/utils/similarity-filter.util';

export abstract class CoreDatabaseContract<Model, Entity> {
  public generateID() {
    return Random.UUID();
  }

  public hashByText(text: string) {
    return StringEx.Hash(text, 'sha256', 'hex');
  }

  public compareHashText(text: string, hashed: string) {
    return this.hashByText(text) === hashed;
  }

  public async hashByPassword(password: string) {
    return await StringEx.HashByPassword(password);
  }

  public async compareHashPassword(password: string, hashed: string) {
    return await StringEx.compareHashPassword(password, hashed);
  }

  public encrypt(data: string): string {
    return StringEx.Compress(JSON.stringify(Crypto.Encrypt(data)));
  }

  public decrypt(data: string): string {
    const encrypted = this.getDecryptedProperty(data);

    return Crypto.Decrypt({
      ...encrypted,
      tag: Buffer.from(encrypted.tag),
    });
  }

  public getDecryptedProperty(data: string): Encrypted {
    return StringEx.Decompress<Encrypted>(data) as Encrypted;
  }

  abstract create(data: Model): Promise<Entity>;
  abstract findAll(): Promise<Entity[]>;
  abstract findOne(id: string): Promise<Entity | never>;
  abstract findBy(
    filter: RecursivePartial<Entity>,
    similarity?: SimilarityType,
  ): Promise<Entity[]>;
  abstract update(id: string, newData: Model): Promise<Entity | never>;
  abstract remove(id: string): Promise<boolean>;
}
