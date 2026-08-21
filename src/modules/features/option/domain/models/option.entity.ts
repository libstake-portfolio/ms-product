import { AggregateRootEntity } from '@common/base/aggregate-root-entity';

import { OptionId } from '../../types/ids/option-id';

import { OptionValue } from './option-value.entity';

export interface OptionProps {
    id: OptionId;

    name: string;

    optionValues: OptionValue[];
}

export class Option extends AggregateRootEntity {
    public readonly id: OptionId;

    protected _name: string;

    protected _optionValues: OptionValue[];

    protected constructor({ id, name, optionValues }: OptionProps) {
        super();
        this.id = id;
        this._name = name;
        this._optionValues = optionValues;
    }

    // Rebuilds an already-persisted entity as-is, without validating.
    public static reconstitute(props: OptionProps): Option {
        return new Option(props);
    }

    public get name(): string {
        return this._name;
    }

    public get optionValues(): OptionValue[] {
        return [...this._optionValues];
    }

    public set name(name: string) {
        this._name = name;
    }

    public copy(): Option {
        return new Option({
            id: this.id.copy(),
            name: this._name,
            optionValues: this._optionValues.map(optionValue => optionValue.copy()),
        });
    }

    public isIdentical(other: Option): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }
}
