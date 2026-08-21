import { DomainRuleException } from '@common/errors/domain-rule.exception';

// Changing the option set once variants exist would leave every one of them answering the wrong question.
export class ProductOptionsLockedException extends DomainRuleException {
    public constructor(productId: string) {
        super(`The option set of product ${productId} can only change while it has no variants.`);
    }
}
