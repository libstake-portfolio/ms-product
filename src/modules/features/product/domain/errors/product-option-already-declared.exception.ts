import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductOptionAlreadyDeclaredException extends DomainRuleException {
    public constructor(optionId: string) {
        super(`Option ${optionId} is already declared on this product.`);
    }
}
