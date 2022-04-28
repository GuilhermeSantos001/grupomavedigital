export class DatabaseModalityOfCoverageConstants {
  private readonly FREE = 'freelancer';
  private readonly FT = 'ft';

  values() {
    return [
      this.FT,
      this.FREE
    ];
  }

  isValid(value: string) {
    return this.values().filter(s => s === value).length > 0;
  }

  notValid(value: string) {
    return this.values().filter(s => s === value).length <= 0;
  }
}