export class DatabasePaymentStatusConstants {
  private readonly PENDING = 'pending';
  private readonly PAID = 'paid';
  private readonly UNPAID = 'unpaid';

  values() {
    return [
      this.PENDING,
      this.PAID,
      this.UNPAID,
    ];
  }

  isValid(value: string) {
    return this.values().filter(s => s === value).length > 0;
  }

  notValid(value: string) {
    return this.values().filter(s => s === value).length <= 0;
  }
}