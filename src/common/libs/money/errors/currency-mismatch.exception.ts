/** Raised when an operation would combine amounts held in different currencies. */
export class CurrencyMismatchException extends Error {
    public constructor(
        public readonly left: string,
        public readonly right: string,
    ) {
        super(`${left} and ${right} cannot be combined.`);
        this.name = CurrencyMismatchException.name;
    }
}
