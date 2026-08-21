import { CurrencyCode, getCurrency } from '../currency/currency';

import { nameLookupFor, textFormatterFor } from './formatter-cache';

/** Which side of the digits the symbol sits on. */
export type SymbolPosition = 'prefix' | 'suffix';

export interface CurrencyDisplay {
    /** The symbol this locale writes for the currency. */
    symbol: string;
    /** Where that symbol sits relative to the digits. */
    symbolPosition: SymbolPosition;
    /** The currency's name as this locale writes it. */
    name: string;
}

export interface CurrencyDisplayOptions {
    /**
     * Drops the qualifier a locale puts on symbols it would otherwise confuse, so a
     * form like CA$ becomes $. Only safe where the currency is not in question.
     */
    narrowSymbol?: boolean;
}

// The pieces a formatted amount is made of that carry digits rather than decoration.
const DIGIT_PARTS = ['integer', 'decimal', 'fraction', 'group'];

/**
 * How a locale writes this currency.
 *
 * ! - Every field here depends on the locale as much as on the currency. The same
 *     currency takes its symbol in front in one locale and behind the digits in
 *     another, so none of this can be cached against the currency alone.
 */
export function describeCurrency(code: CurrencyCode, locale: Intl.LocalesArgument, options: CurrencyDisplayOptions = {}): CurrencyDisplay {
    const parts = textFormatterFor(code, locale, { currencyDisplay: options.narrowSymbol ? 'narrowSymbol' : 'symbol' }).formatToParts('1');
    const symbolAt = parts.findIndex(part => part.type === 'currency');
    const digitsAt = parts.findIndex(part => DIGIT_PARTS.includes(part.type));
    // Locale data does not reach every code, and echoing the code back is how it says so.
    const localized = nameLookupFor(locale).of(code);

    return {
        symbol: parts[symbolAt]?.value ?? code,
        symbolPosition: symbolAt < digitsAt ? 'prefix' : 'suffix',
        name: !localized || localized === code ? getCurrency(code).name : localized,
    };
}
