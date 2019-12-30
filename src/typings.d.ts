/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare enum NumberFormatStyle {
  Decimal = 0,
  Percent = 1,
  Currency = 2,
}
declare class NumberFormatter {
  static format(num: number, locale: string, style: NumberFormatStyle, { minimumIntegerDigits, minimumFractionDigits, maximumFractionDigits, currency, currencyAsSymbol }?: {
    minimumIntegerDigits?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
    currencyAsSymbol?: boolean;
  }): string;
}
declare class DateFormatter {
  static format(date: Date, locale: string, pattern: string): string;
}
