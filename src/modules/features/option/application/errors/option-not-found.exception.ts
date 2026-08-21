import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class OptionNotFoundException extends DomainRuleException {
    public constructor(optionId: string) {
        super(`Option ${optionId} does not exist.`);
    }
}
