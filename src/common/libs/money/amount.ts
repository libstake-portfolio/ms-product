import Decimal from 'decimal.js';

import { MoneyDecimal } from './decimal';
import { InvalidAmountException } from './errors/invalid-amount.exception';

/** Anything a caller may hand over in place of an amount. */
export type MoneyAmount = Decimal | string | number;

// A double round-trips this many significant digits. Needing more means the value
// arrived already damaged by binary floating point, before this library saw it.
const RELIABLE_NUMBER_DIGITS = 15;

export function toDecimal(amount: MoneyAmount): Decimal {
    if (typeof amount === 'number' && !isReliable(amount)) {
        throw new InvalidAmountException(String(amount), `needs more than ${RELIABLE_NUMBER_DIGITS} significant digits, so it lost precision before arriving; pass it as a string`);
    }
    let value: Decimal;
    try {
        value = new MoneyDecimal(amount);
    } catch {
        throw new InvalidAmountException(String(amount), 'is not a number');
    }
    if (!value.isFinite()) throw new InvalidAmountException(String(amount), 'is not finite');
    return value;
}

function isReliable(amount: number): boolean {
    if (!Number.isFinite(amount)) return false;
    const significand = Math.abs(amount)
        .toExponential()
        .split('e')[0]
        .replace(/[^0-9]/g, '')
        .replace(/0+$/, '');
    return significand.length <= RELIABLE_NUMBER_DIGITS;
}
