import { DomainEntity } from '@common/base/domain-entity';

import { ProductVariantId } from '../../types/ids/product-variant-id';

import { ProductVariantOptionValue } from './product-variant-option-value.value-object';

export interface ProductVariantProps {
    id: ProductVariantId;

    handle: string;
    name: string;

    optionValues: ProductVariantOptionValue[];
}

export class ProductVariant extends DomainEntity {
    public readonly id: ProductVariantId;

    protected _handle: string;
    protected _name: string;

    // Fixed for the lifetime of the variant: a different combination is a different variant.
    protected readonly _optionValues: ProductVariantOptionValue[];

    protected constructor({ id, handle, name, optionValues }: ProductVariantProps) {
        super();
        this.id = id;
        this._handle = handle;
        this._name = name;
        this._optionValues = optionValues;
    }

    public static create(props: ProductVariantProps): ProductVariant {
        return new ProductVariant(props);
    }

    // Rebuilds an already-persisted entity as-is, without validating.
    public static reconstitute(props: ProductVariantProps): ProductVariant {
        return new ProductVariant(props);
    }

    public get handle(): string {
        return this._handle;
    }

    public get name(): string {
        return this._name;
    }

    public get optionValues(): ProductVariantOptionValue[] {
        return [...this._optionValues];
    }

    // The root drives these so the fact reaches the event log; a variant records nothing on its own.
    public rename(name: string): void {
        this._name = name;
    }

    public changeHandle(handle: string): void {
        this._handle = handle;
    }

    public copy(): ProductVariant {
        return new ProductVariant({
            id: this.id.copy(),
            handle: this._handle,
            name: this._name,
            optionValues: this._optionValues.map(optionValue => optionValue.copy()),
        });
    }

    public isIdentical(other: ProductVariant): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }
}
