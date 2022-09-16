import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export abstract class RepositoryContract<Model, Entity, ModelDatabaseContract> {
  constructor(
    protected readonly database: ModelDatabaseContract,
    protected readonly locale: Locale,
    protected readonly jsonEx: JsonEx,
  ) {}

  protected get createdAt() {
    return new Date();
  }

  protected get updatedAt() {
    return new Date();
  }

  protected get deletedAt() {
    return new Date();
  }

  public abstract beforeSave(model: Model): Promise<Model>;
  public abstract beforeUpdate(
    beforeData: Model,
    nextData: Partial<Model>,
  ): Promise<Model>;
  public abstract decryptFieldValue(value: string): Promise<string>;
  public abstract register(model: Model): Promise<Entity | Error>;
  public abstract findMany(): Promise<Entity[]>;
  public abstract findById(id: string): Promise<Entity | Error>;
  public abstract update(
    id: string,
    newData: Partial<Model>,
  ): Promise<Entity | Error>;
  public abstract remove(id: string): Promise<boolean | Error>;
}
