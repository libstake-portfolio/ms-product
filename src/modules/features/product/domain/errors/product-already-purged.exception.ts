import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductAlreadyPurgedException extends DomainRuleException {
    public constructor(productId: string) {
        super(`Product ${productId} has been purged and no longer accepts changes.`);
    }
}
