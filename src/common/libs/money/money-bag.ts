import Decimal from 'decimal.js';

import { MoneyAmount, toDecimal } from './amount';
import { Currency, CurrencyCode, getCurrency, parseCurrencyCode } from './currency/currency';
import { MoneyDecimal } from './decimal';
import { CurrencyMismatchException } from './errors/currency-mismatch.exception';

/** How a value is cut down when digits have to be dropped. This library never picks one. */
export type RoundingMode = Decimal.Rounding;

export interface SerializedMoneyBag {
    amount: string;
    currencyCode: CurrencyCode;
}

/**
 * An amount held in one currency.
 *
 * Arithmetic keeps every digit it produces. Nothing here rounds on its own, because
 * when to give up precision is a decision this library has no standing to make.
 */
export class MoneyBag {
    public readonly amount: Decimal;
    public readonly currency: Currency;

    protected constructor(amount: Decimal, currency: Currency) {
        this.amount = amount;
        this.currency = currency;
    }

    public static of(amount: MoneyAmount, code: CurrencyCode): MoneyBag {
        return new MoneyBag(toDecimal(amount), getCurrency(code));
    }

    public static zero(code: CurrencyCode): MoneyBag {
        return new MoneyBag(new MoneyDecimal(0), getCurrency(code));
    }

    /** Rebuilds a bag from values that came in from outside the type system. */
    public static deserialize(serialized: { amount: string; currencyCode: string }): MoneyBag {
        return new MoneyBag(toDecimal(serialized.amount), getCurrency(parseCurrencyCode(serialized.currencyCode)));
    }

    public get currencyCode(): CurrencyCode {
        return this.currency.code;
    }

    /** Digits the amount currently occupies, which may be more than the currency can express. */
    public get scale(): number {
        return this.amount.decimalPlaces();
    }

    public plus(other: MoneyBag): MoneyBag {
        return this.withAmount(this.amount.plus(this.sharedAmount(other)));
    }

    public minus(other: MoneyBag): MoneyBag {
        return this.withAmount(this.amount.minus(this.sharedAmount(other)));
    }

    public times(factor: MoneyAmount): MoneyBag {
        return this.withAmount(this.amount.times(toDecimal(factor)));
    }

    public dividedBy(divisor: MoneyAmount): MoneyBag {
        return this.withAmount(this.amount.div(toDecimal(divisor)));
    }

    public negated(): MoneyBag {
        return this.withAmount(this.amount.negated());
    }

    /** Cuts the amount down to the digits this currency defines. */
    public round(mode: RoundingMode): MoneyBag {
        return this.roundTo(this.currency.minorUnits, mode);
    }

    public roundTo(scale: number, mode: RoundingMode): MoneyBag {
        return this.withAmount(this.amount.toDecimalPlaces(scale, mode));
    }

    public equals(other: MoneyBag): boolean {
        if (!other) return false;
        return this.currency.code === other.currency.code && this.amount.equals(other.amount);
    }

    /** Negative when this holds less, zero when the two are equal, positive when this holds more. */
    public compareTo(other: MoneyBag): number {
        return this.amount.comparedTo(this.sharedAmount(other));
    }

    public isGreaterThan(other: MoneyBag): boolean {
        return this.compareTo(other) > 0;
    }

    public isGreaterThanOrEqual(other: MoneyBag): boolean {
        return this.compareTo(other) >= 0;
    }

    public isLessThan(other: MoneyBag): boolean {
        return this.compareTo(other) < 0;
    }

    public isLessThanOrEqual(other: MoneyBag): boolean {
        return this.compareTo(other) <= 0;
    }

    public isZero(): boolean {
        return this.amount.isZero();
    }

    public isPositive(): boolean {
        return this.amount.greaterThan(0);
    }

    public isNegative(): boolean {
        return this.amount.isNegative() && !this.amount.isZero();
    }

    public copy(): MoneyBag {
        // Both fields are immutable, so there is nothing underneath to clone.
        return new MoneyBag(this.amount, this.currency);
    }

    /**
     * Hands the amount over as a plain decimal string, never in exponent notation.
     *
     * Digits survive untouched unless a rounding mode is given, in which case the
     * result carries exactly as many decimals as the currency defines.
     */
    public serialize(round?: RoundingMode): SerializedMoneyBag {
        const amount = round === undefined ? this.amount.toFixed() : this.amount.toDecimalPlaces(this.currency.minorUnits, round).toFixed(this.currency.minorUnits);
        return { amount, currencyCode: this.currency.code };
    }

    /** Amount and code, for logs and messages. Anything a person reads goes through the formatter. */
    public toString(): string {
        return `${this.amount.toFixed()} ${this.currency.code}`;
    }

    private withAmount(amount: Decimal): MoneyBag {
        return new MoneyBag(amount, this.currency);
    }

    private sharedAmount(other: MoneyBag): Decimal {
        if (this.currency.code !== other.currency.code) throw new CurrencyMismatchException(this.currency.code, other.currency.code);
        return other.amount;
    }
}
