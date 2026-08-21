import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class CategoryNotArchivedException extends DomainRuleException {
    public constructor(categoryId: string) {
        super(`Category ${categoryId} must be archived before it is purged, so whoever references it can let go first.`);
    }
}
