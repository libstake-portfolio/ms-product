import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class CategoryCycleException extends DomainRuleException {
    public constructor(categoryId: string) {
        super(`Category ${categoryId} cannot be placed under itself or anything below it.`);
    }
}
