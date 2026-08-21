import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductNotArchivedException extends DomainRuleException {
    public constructor(productId: string) {
        super(`Product ${productId} must be archived before it is purged, so downstream can release it first.`);
    }
}
