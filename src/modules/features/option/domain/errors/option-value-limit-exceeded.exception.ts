import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class OptionValueLimitExceededException extends DomainRuleException {
    public constructor(limit: number) {
        super(`An option carries at most ${limit} values.`);
    }
}
