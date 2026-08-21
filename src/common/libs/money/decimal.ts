import Decimal from 'decimal.js';

/**
 * The constructor every calculation in this library runs through.
 *
 * ! - Configuring the imported constructor directly would change arithmetic for
 *     every other consumer in the process, so this isolated clone is used instead.
 *     Values it produces stay interchangeable with those of the imported one.
 */
export const MoneyDecimal = Decimal.clone({
    // Wide enough that intermediate division keeps far more digits than any
    // currency can express, so precision is lost only where the caller asks.
    precision: 34,
    // Reached only when a result exceeds the digits above. Money is never
    // rounded implicitly, so this is not a rounding policy for amounts.
    rounding: Decimal.ROUND_HALF_EVEN,
});
