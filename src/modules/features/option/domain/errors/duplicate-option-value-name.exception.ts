import { DomainRuleException } from '@common/errors/domain-rule.exception';

export class DuplicateOptionValueNameException extends DomainRuleException {
    public constructor(name: string) {
        super(`This option already offers a value called "${name}".`);
    }
}
