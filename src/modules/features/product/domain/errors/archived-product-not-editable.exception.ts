import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ArchivedProductNotEditableException extends DomainRuleException {
    public constructor(productId: string) {
        super(`Product ${productId} is archived; the only change it still accepts is being purged.`);
    }
}
