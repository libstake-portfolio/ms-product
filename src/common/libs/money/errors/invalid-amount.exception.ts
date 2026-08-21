/** Raised when a value cannot stand for an amount of money. */
export class InvalidAmountException extends Error {
    public constructor(
        public readonly value: string,
        reason: string,
    ) {
        super(`${value} ${reason}.`);
        this.name = InvalidAmountException.name;
    }
}
