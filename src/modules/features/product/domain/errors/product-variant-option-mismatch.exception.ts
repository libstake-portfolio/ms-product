import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductVariantOptionMismatchException extends DomainRuleException {
    public constructor() {
        super(`A variant must answer every option the product declares, exactly once each.`);
    }
}
