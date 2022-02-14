export class DatabaseModalityOfCoverageConstants {
  private readonly B2 = 'b2';
  private readonly FREE = 'freelancer';
  private readonly FT = 'ft';
  private readonly PACKAGE_HOURS = 'pacote_de_horas';

  values() {
    return [
      this.FT,
      this.FREE,
      this.B2,
      this.PACKAGE_HOURS,
    ];
  }

  isValid(value: string) {
    return this.values().filter(s => s === value).length > 0;
  }

  notValid(value: string) {
    return this.values().filter(s => s === value).length <= 0;
  }
}