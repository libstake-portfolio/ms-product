import Decimal from 'decimal.js';

import { MoneyAmount, toDecimal } from './amount';
import { MoneyDecimal } from './decimal';
import { InvalidAllocationException } from './errors/invalid-allocation.exception';
import { InvalidAmountException } from './errors/invalid-amount.exception';
import { MoneyBag } from './money-bag';

/**
 * Splits an amount in the proportions asked for, so the parts add back up to the whole.
 *
 * A currency's smallest unit rarely divides evenly, and rounding each part on its own
 * loses or invents money. The units left over instead go one at a time to the parts
 * that fell furthest short, in the order the weights were given.
 */
export function allocate(total: MoneyBag, weights: readonly MoneyAmount[]): MoneyBag[] {
    if (weights.length === 0) throw new InvalidAllocationException('needs at least one weight');

    const scale = total.currency.minorUnits;
    if (total.scale > scale) {
        throw new InvalidAmountException(total.amount.toFixed(), `is finer than ${total.currencyCode} can hold, so a split would leave a remainder nobody can receive`);
    }

    const parsed = weights.map(toDecimal);
    if (parsed.some(weight => weight.isNegative())) throw new InvalidAllocationException('cannot take a negative weight');
    const weightTotal = parsed.reduce((sum, weight) => sum.plus(weight), new MoneyDecimal(0));
    if (weightTotal.isZero()) throw new InvalidAllocationException('needs at least one weight above zero');

    // Counting in whole smallest units keeps every step exact, so the parts can be
    // checked against the whole without a tolerance.
    const perUnit = new MoneyDecimal(10).pow(scale);
    const sign = total.amount.isNegative() ? -1 : 1;
    const totalUnits = total.amount.abs().times(perUnit);

    const parts = parsed.map((weight, order) => {
        const exact = totalUnits.times(weight).div(weightTotal);
        const whole = exact.toDecimalPlaces(0, Decimal.ROUND_DOWN);
        return { order, whole, shortfall: exact.minus(whole) };
    });

    let leftover = totalUnits.minus(parts.reduce((sum, part) => sum.plus(part.whole), new MoneyDecimal(0)));
    // Equal shortfalls keep the caller's order, so the same request always splits the same way.
    for (const part of [...parts].sort((left, right) => right.shortfall.comparedTo(left.shortfall) || left.order - right.order)) {
        if (!leftover.greaterThan(0)) break;
        part.whole = part.whole.plus(1);
        leftover = leftover.minus(1);
    }

    return parts.map(part => MoneyBag.of(part.whole.div(perUnit).times(sign), total.currencyCode));
}
