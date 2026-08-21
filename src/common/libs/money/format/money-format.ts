import { MoneyBag } from '../money-bag';

import { textFormatterFor } from './formatter-cache';

/** Everything the caller may choose. What the amount already decides is not on offer. */
export type MoneyFormatOptions = Omit<Intl.NumberFormatOptions, 'style' | 'currency'>;

/**
 * Writes the amount the way the locale writes this currency.
 *
 * ! - The locale decides how many digits appear, and that count does not always match
 *     the digits the currency defines, so the result can read as rounded.
 */
export function formatMoney(money: MoneyBag, locale: Intl.LocalesArgument, options: MoneyFormatOptions = {}): string {
    return textFormatterFor(money.currencyCode, locale, options).format(money.amount.toFixed());
}

/** The same rendering, broken into the pieces it is built from. */
export function formatMoneyToParts(money: MoneyBag, locale: Intl.LocalesArgument, options: MoneyFormatOptions = {}): Intl.NumberFormatPart[] {
    return textFormatterFor(money.currencyCode, locale, options).formatToParts(money.amount.toFixed());
}
