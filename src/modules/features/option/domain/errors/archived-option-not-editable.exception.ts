import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ArchivedOptionNotEditableException extends DomainRuleException {
    public constructor(optionId: string) {
        super(`Option ${optionId} is archived; the only change it still accepts is being purged.`);
    }
}
