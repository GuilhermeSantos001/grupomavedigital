export class DatabasePaymentMethodConstants {
  private readonly MONEY = 'money';
  private readonly CARD = 'card';

  values() {
    return [
      this.MONEY,
      this.CARD,
    ];
  }

  isValid(value: string) {
    return this.values().filter(s => s === value).length > 0;
  }

  notValid(value: string) {
    return this.values().filter(s => s === value).length <= 0;
  }
}