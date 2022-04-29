export class DatabaseStatusConstants {
  private readonly ACTIVE = 'available';
  private readonly INACTIVE = 'unavailable';
  private readonly DELETED = 'blocked';

  values() {
    return [
      this.ACTIVE,
      this.INACTIVE,
      this.DELETED,
    ];
  }

  isValid(value: string) {
    return this.values().filter(s => s === value).length > 0;
  }

  notValid(value: string) {
    return this.values().filter(s => s === value).length <= 0;
  }
}