import { UnsupportedCurrencyException } from '../errors/unsupported-currency.exception';

import { ISO_CURRENCY_TABLE } from './currency-table.generated';

/** Every currency this library recognises. Codes outside it cannot be written at all. */
export type CurrencyCode = keyof typeof ISO_CURRENCY_TABLE;

export interface Currency {
    readonly code: CurrencyCode;
    /** The standard's numeric identifier, three digits wide including leading zeroes. */
    readonly numericCode: string;
    /** Digits below the major unit. The smallest amount the currency can express. */
    readonly minorUnits: number;
    /** The currency's full English name, as in South Korean Won. */
    readonly name: string;
    /** The unit's own English name, as in Won. Shorter, and not tied to a country. */
    readonly shortName: string;
}

export function isCurrencyCode(value: string): value is CurrencyCode {
    return Object.hasOwn(ISO_CURRENCY_TABLE, value);
}

/** Narrows a value that arrived from outside the type system. */
export function parseCurrencyCode(value: string): CurrencyCode {
    if (!isCurrencyCode(value)) throw new UnsupportedCurrencyException(value);
    return value;
}

export function getCurrency(code: CurrencyCode): Currency {
    return { code, ...ISO_CURRENCY_TABLE[code] };
}

/** Every currency this library carries, in code order. */
export function listCurrencies(): Currency[] {
    return (Object.keys(ISO_CURRENCY_TABLE) as CurrencyCode[]).map(getCurrency);
}
