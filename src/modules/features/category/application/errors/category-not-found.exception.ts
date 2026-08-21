import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class CategoryNotFoundException extends DomainRuleException {
    public constructor(categoryId: string) {
        super(`Category ${categoryId} does not exist.`);
    }
}
