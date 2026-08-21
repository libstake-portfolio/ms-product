import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ArchivedCategoryNotEditableException extends DomainRuleException {
    public constructor(categoryId: string) {
        super(`Category ${categoryId} is archived; the only change it still accepts is being purged.`);
    }
}
