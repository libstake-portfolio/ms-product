import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductVariantLimitExceededException extends DomainRuleException {
    public constructor(limit: number) {
        super(`A product carries at most ${limit} variants.`);
    }
}
