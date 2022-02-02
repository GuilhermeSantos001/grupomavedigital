export class DatabasePaymentMethodConstants {
  private readonly MONEY = 'money';
  private readonly CARD = 'card';

  status() {
    return [
      this.MONEY,
      this.CARD,
    ];
  }

  isValid(status: string) {
    return this.status().filter(s => s === status).length > 0;
  }

  notValid(status: string) {
    return this.status().filter(s => s === status).length <= 0;
  }
}