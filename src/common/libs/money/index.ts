// The whole surface of this library. Anything absent here is internal, and stays
// free to change when the library moves out of this repository and is published.
//
// ! - Values produced here carry decimal.js amounts. A consumer that reaches for
//     those amounts must resolve decimal.js to the same copy this library loaded,
//     or values will fail an instance check while still comparing equal.

export { allocate } from './allocate';
export { describeCurrency } from './format/currency-display';
export { formatMoney, formatMoneyToParts } from './format/money-format';
export { getCurrency, isCurrencyCode, listCurrencies, parseCurrencyCode } from './currency/currency';
export { MoneyBag } from './money-bag';

export type { Currency, CurrencyCode } from './currency/currency';
export type { CurrencyDisplay, CurrencyDisplayOptions, SymbolPosition } from './format/currency-display';
export type { MoneyAmount } from './amount';
export type { MoneyFormatOptions } from './format/money-format';
export type { RoundingMode, SerializedMoneyBag } from './money-bag';

export { CurrencyMismatchException } from './errors/currency-mismatch.exception';
export { InvalidAllocationException } from './errors/invalid-allocation.exception';
export { InvalidAmountException } from './errors/invalid-amount.exception';
export { UnsupportedCurrencyException } from './errors/unsupported-currency.exception';
