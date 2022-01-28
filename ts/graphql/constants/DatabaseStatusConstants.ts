export class DatabaseStatusConstants {
  private readonly ACTIVE = 'available';
  private readonly INACTIVE = 'unavailable';
  private readonly DELETED = 'blocked';

  status() {
    return [
      this.ACTIVE,
      this.INACTIVE,
      this.DELETED,
    ];
  }

  isValid(status: string) {
    return this.status().filter(s => s === status).length > 0;
  }

  notValid(status: string) {
    return this.status().filter(s => s === status).length <= 0;
  }
}