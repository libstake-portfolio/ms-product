import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class CategoryHasChildrenException extends DomainRuleException {
    public constructor(categoryId: string) {
        super(`Category ${categoryId} still has categories under it; those go first.`);
    }
}
