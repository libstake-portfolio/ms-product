import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class OptionAlreadyPurgedException extends DomainRuleException {
    public constructor(optionId: string) {
        super(`Option ${optionId} has been purged and no longer accepts changes.`);
    }
}
