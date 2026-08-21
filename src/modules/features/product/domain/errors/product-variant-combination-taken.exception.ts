import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductVariantCombinationTakenException extends DomainRuleException {
    public constructor() {
        super(`Another variant of this product already answers the options this way.`);
    }
}
