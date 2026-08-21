import { DomainEntity } from '@common/base/domain-entity';

import { OptionValueId } from '../../types/ids/option-value-id';

export interface OptionValueProps {
    id: OptionValueId;
    name: string;
}

export class OptionValue extends DomainEntity {
    public readonly id: OptionValueId;

    protected _name: string;

    protected constructor({ id, name }: OptionValueProps) {
        super();
        this.id = id;
        this._name = name;
    }

    public static create(props: OptionValueProps): OptionValue {
        return new OptionValue(props);
    }

    // Rebuilds an already-persisted entity as-is, without validating.
    public static reconstitute(props: OptionValueProps): OptionValue {
        return new OptionValue(props);
    }

    public get name(): string {
        return this._name;
    }

    // The root drives this so the fact reaches the event log; a value records nothing on its own.
    public rename(name: string): void {
        this._name = name;
    }

    public copy(): OptionValue {
        return new OptionValue({
            id: this.id.copy(),
            name: this._name,
        });
    }

    public isIdentical(other: OptionValue): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }
}
