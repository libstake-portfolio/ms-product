import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class OptionNotArchivedException extends DomainRuleException {
    public constructor(optionId: string) {
        super(`Option ${optionId} must be archived before it is purged, so whoever references it can let go first.`);
    }
}
