import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class ProductOptionsReorderMismatchException extends DomainRuleException {
    public constructor() {
        super(`Reordering must list every declared option exactly once.`);
    }
}
