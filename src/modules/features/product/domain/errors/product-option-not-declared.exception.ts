import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductOptionNotDeclaredException extends DomainRuleException {
    public constructor(optionId: string) {
        super(`Option ${optionId} is not declared on this product.`);
    }
}
