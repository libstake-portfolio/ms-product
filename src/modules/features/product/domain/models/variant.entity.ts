import { DomainEntity } from '@common/base/domain-entity';
import { removeHtmlTags, sanitizeHtml } from '@common/utils/html';
import { OptionId } from '@modules/features/option/types/ids/option-id';
import { OptionValueId } from '@modules/features/option/types/ids/option-value-id';

import { VariantId } from '../../types/ids/variant-id';

export interface VariantProps {
    id: VariantId;

    handle: string;
    name: string;
    description: string;
    descriptionHtml: string;

    optionId: OptionId;
    optionValueId: OptionValueId;
}

export class Variant extends DomainEntity {
    public readonly id: VariantId;

    protected _handle: string;
    protected _name: string;
    protected _description: string;
    protected _descriptionHtml: string;

    public readonly optionId: OptionId;
    public readonly optionValueId: OptionValueId;

    protected constructor({ id, handle, name, description, descriptionHtml, optionId, optionValueId }: VariantProps) {
        super();
        this.id = id;
        this._handle = handle;
        this._name = name;
        this._description = description;
        this._descriptionHtml = descriptionHtml;
        this.optionId = optionId;
        this.optionValueId = optionValueId;
    }

    // Rebuilds an already-persisted entity as-is, without validating.
    public static reconstitute(props: VariantProps): Variant {
        return new Variant(props);
    }

    public get handle(): string {
        return this._handle;
    }

    public get name(): string {
        return this._name;
    }

    public get description(): string {
        return this._description;
    }

    public get descriptionHtml(): string {
        return this._descriptionHtml;
    }

    public set handle(handle: string) {
        this._handle = handle;
    }

    public set name(name: string) {
        this._name = name;
    }

    public set descriptionHtml(descriptionHtml: string) {
        this._descriptionHtml = sanitizeHtml(descriptionHtml);
        this._description = removeHtmlTags(this._descriptionHtml);
    }

    public copy(): Variant {
        return new Variant({
            id: this.id.copy(),
            handle: this._handle,
            name: this._name,
            description: this._description,
            descriptionHtml: this._descriptionHtml,
            optionId: this.optionId.copy(),
            optionValueId: this.optionValueId.copy(),
        });
    }

    public isIdentical(other: Variant): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }
}
