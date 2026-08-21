import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class CategoryAlreadyPurgedException extends DomainRuleException {
    public constructor(categoryId: string) {
        super(`Category ${categoryId} has been purged and no longer accepts changes.`);
    }
}
