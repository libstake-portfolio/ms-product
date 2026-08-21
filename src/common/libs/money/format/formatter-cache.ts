import { CurrencyCode } from '../currency/currency';

/**
 * What the runtime formatter does with decimal text: it reads every digit, where a
 * number would cap the amount at what a double can hold.
 *
 * The bundled declarations describe this only from a recent library level onward, so
 * naming it here keeps that level from becoming something every consumer must adopt.
 */
export interface TextFormatter {
    format(value: string): string;
    formatToParts(value: string): Intl.NumberFormatPart[];
}

// Building either of these costs far more than using one, and a process reuses the
// same handful of locale and option combinations for its whole life.
const formatters = new Map<string, TextFormatter>();
const nameLookups = new Map<string, Intl.DisplayNames>();

export function textFormatterFor(code: CurrencyCode, locale: Intl.LocalesArgument, options: Intl.NumberFormatOptions): TextFormatter {
    const key = [code, String(locale), JSON.stringify(options, Object.keys(options).sort())].join(' ');
    const cached = formatters.get(key);
    if (cached) return cached;

    const formatter = new Intl.NumberFormat(locale, { ...options, style: 'currency', currency: code }) as unknown as TextFormatter;
    formatters.set(key, formatter);
    return formatter;
}

export function nameLookupFor(locale: Intl.LocalesArgument): Intl.DisplayNames {
    const key = String(locale);
    const cached = nameLookups.get(key);
    if (cached) return cached;

    const lookup = new Intl.DisplayNames(locale, { type: 'currency' });
    nameLookups.set(key, lookup);
    return lookup;
}
