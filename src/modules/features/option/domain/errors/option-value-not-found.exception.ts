import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class OptionValueNotFoundException extends DomainRuleException {
    public constructor(optionValueId: string) {
        super(`Value ${optionValueId} does not belong to this option.`);
    }
}
