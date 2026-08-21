import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductVariantNotFoundException extends DomainRuleException {
    public constructor(productVariantId: string) {
        super(`Variant ${productVariantId} does not belong to this product.`);
    }
}
