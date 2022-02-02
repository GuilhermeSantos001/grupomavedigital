export class DatabasePaymentStatusConstants {
  private readonly PENDING = 'pending';
  private readonly PAID = 'paid';
  private readonly UNPAID = 'unpaid';

  status() {
    return [
      this.PENDING,
      this.PAID,
      this.UNPAID,
    ];
  }

  isValid(status: string) {
    return this.status().filter(s => s === status).length > 0;
  }

  notValid(status: string) {
    return this.status().filter(s => s === status).length <= 0;
  }
}