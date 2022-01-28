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

  isValidation(status: string) {
    return this.status().filter(s => s === status).length > 0;
  }

  notValidation(status: string) {
    return this.status().filter(s => s === status).length <= 0;
  }
}