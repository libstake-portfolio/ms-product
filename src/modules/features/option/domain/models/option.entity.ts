import { v7 } from 'uuid';

import { AggregateRootEntity } from '@common/base/aggregate-root-entity';

import { OptionId } from '../../types/ids/option-id';
import { OptionValueId } from '../../types/ids/option-value-id';
import { ArchivedOptionNotEditableException } from '../errors/archived-option-not-editable.exception';
import { DuplicateOptionValueNameException } from '../errors/duplicate-option-value-name.exception';
import { OptionAlreadyPurgedException } from '../errors/option-already-purged.exception';
import { OptionNotArchivedException } from '../errors/option-not-archived.exception';
import { OptionValueLimitExceededException } from '../errors/option-value-limit-exceeded.exception';
import { OptionValueNotFoundException } from '../errors/option-value-not-found.exception';
import { OptionArchivedEvent } from '../events/option-archived.event';
import { OptionCreatedEvent } from '../events/option-created.event';
import { OptionPurgedEvent } from '../events/option-purged.event';
import { OptionRenamedEvent } from '../events/option-renamed.event';
import { OptionValueAddedEvent } from '../events/option-value-added.event';
import { OptionValueRemovedEvent } from '../events/option-value-removed.event';
import { OptionValueRenamedEvent } from '../events/option-value-renamed.event';

import { OptionValue } from './option-value.entity';

// Cap on how wide one load can get. Set well above a product's own limits: a palette is long even
// though any single product offers only a few of its entries.
const MAX_VALUES = 100;

export interface OptionProps {
    id: OptionId;

    name: string;

    archivedAt: Date | null;
    deletedAt: Date | null;

    values: OptionValue[];
}

export interface CreateOptionProps {
    name: string;
}

export class Option extends AggregateRootEntity {
    public readonly id: OptionId;

    protected _name: string;

    protected _archivedAt: Date | null;
    protected _deletedAt: Date | null;

    protected _values: OptionValue[];

    protected constructor({ id, name, archivedAt, deletedAt, values }: OptionProps) {
        super();
        this.id = id;
        this._name = name;
        this._archivedAt = archivedAt;
        this._deletedAt = deletedAt;
        this._values = values;
    }

    public static create({ name }: CreateOptionProps): Option {
        const id = new OptionId(v7());
        const option = new Option({ id, name, archivedAt: null, deletedAt: null, values: [] });
        option.record(new OptionCreatedEvent({ optionId: id, name }));

        return option;
    }

    // Rebuilds an already-persisted entity as-is, without validating and without recording anything.
    public static reconstitute(props: OptionProps): Option {
        return new Option(props);
    }

    public get name(): string {
        return this._name;
    }

    public get archivedAt(): Date | null {
        return this._archivedAt;
    }

    public get deletedAt(): Date | null {
        return this._deletedAt;
    }

    // Children leave as copies. Handing out the originals would let a caller change them without the root noticing.
    public get values(): OptionValue[] {
        return this._values.map(value => value.copy());
    }

    public rename(name: string): void {
        this.requireEditable();
        if (this._name === name) return;

        const previousName = this._name;
        this._name = name;
        this.record(new OptionRenamedEvent({ optionId: this.id, name, previousName }));
    }

    public addValue(name: string): OptionValueId {
        this.requireEditable();
        if (this._values.length >= MAX_VALUES) throw new OptionValueLimitExceededException(MAX_VALUES);
        this.requireNameFree(name, null);

        const id = new OptionValueId(v7());
        this._values.push(OptionValue.create({ id, name }));
        this.record(new OptionValueAddedEvent({ optionId: this.id, optionValueId: id, name }));

        return id;
    }

    public removeValue(optionValueId: OptionValueId): void {
        this.requireEditable();

        const index = this._values.findIndex(value => value.id.equals(optionValueId));
        if (index < 0) throw new OptionValueNotFoundException(optionValueId.serialize());

        this._values.splice(index, 1);
        this.record(new OptionValueRemovedEvent({ optionId: this.id, optionValueId }));
    }

    public renameValue(optionValueId: OptionValueId, name: string): void {
        this.requireEditable();
        const value = this.requireValue(optionValueId);
        if (value.name === name) return;

        this.requireNameFree(name, optionValueId);

        const previousName = value.name;
        value.rename(name);
        this.record(new OptionValueRenamedEvent({ optionId: this.id, optionValueId, name, previousName }));
    }

    public archive(): void {
        this.requireNotPurged();
        if (this._archivedAt !== null) return;

        this._archivedAt = new Date();
        this.record(new OptionArchivedEvent({ optionId: this.id }));
    }

    public purge(): void {
        this.requireNotPurged();
        if (this._archivedAt === null) throw new OptionNotArchivedException(this.id.serialize());

        this._deletedAt = new Date();
        this.record(new OptionPurgedEvent({ optionId: this.id }));
    }

    public copy(): Option {
        return new Option({
            id: this.id.copy(),
            name: this._name,
            archivedAt: this._archivedAt ? new Date(this._archivedAt) : null,
            deletedAt: this._deletedAt ? new Date(this._deletedAt) : null,
            values: this._values.map(value => value.copy()),
        });
    }

    public isIdentical(other: Option): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }

    private requireNotPurged(): void {
        if (this._deletedAt !== null) throw new OptionAlreadyPurgedException(this.id.serialize());
    }

    private requireEditable(): void {
        this.requireNotPurged();
        if (this._archivedAt !== null) throw new ArchivedOptionNotEditableException(this.id.serialize());
    }

    private requireValue(optionValueId: OptionValueId): OptionValue {
        const value = this._values.find(candidate => candidate.id.equals(optionValueId));
        if (!value) throw new OptionValueNotFoundException(optionValueId.serialize());

        return value;
    }

    private requireNameFree(name: string, excluding: OptionValueId | null): void {
        const taken = this._values.some(value => value.name === name && !(excluding !== null && value.id.equals(excluding)));
        if (taken) throw new DuplicateOptionValueNameException(name);
    }
}
