import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductOptionLimitExceededException extends DomainRuleException {
    public constructor(limit: number) {
        super(`A product carries at most ${limit} options.`);
    }
}
