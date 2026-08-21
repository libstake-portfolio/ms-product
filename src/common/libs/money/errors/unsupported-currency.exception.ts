/** Raised when a value names a currency outside the ISO 4217 codes this library carries. */
export class UnsupportedCurrencyException extends Error {
    public constructor(public readonly code: string) {
        super(`${code} is not a supported currency code.`);
        this.name = UnsupportedCurrencyException.name;
    }
}
