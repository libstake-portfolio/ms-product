/**
 * Base for a domain rule that refused a request.
 *
 * Kept apart from the exceptions raised by wrong internal calls: this family means the asker wanted
 * something the model does not allow, and answering it is the caller's job rather than a defect to fix.
 */
export abstract class DomainRuleException extends Error {
    protected constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}
