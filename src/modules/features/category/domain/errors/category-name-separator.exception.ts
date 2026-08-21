import { DomainRuleException } from '@common/errors/domain-rule.exception';

// The full name is the names of the ancestors joined, so a name carrying the joiner would split into two.
export class CategoryNameSeparatorException extends DomainRuleException {
    public constructor(separator: string) {
        super(`A category name cannot contain "${separator}".`);
    }
}
