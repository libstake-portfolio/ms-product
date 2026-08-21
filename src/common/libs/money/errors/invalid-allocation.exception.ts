/** Raised when weights cannot describe a split. */
export class InvalidAllocationException extends Error {
    public constructor(reason: string) {
        super(`An allocation ${reason}.`);
        this.name = InvalidAllocationException.name;
    }
}
