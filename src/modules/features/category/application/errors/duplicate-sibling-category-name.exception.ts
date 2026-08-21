import { DomainRuleException } from '@common/errors/domain-rule.exception';

// Two categories in the same place under the same name would spell out to the same full name.
export class DuplicateSiblingCategoryNameException extends DomainRuleException {
    public constructor(name: string) {
        super(`Another category in the same place is already called "${name}".`);
    }
}
