import { ValueObject } from '@common/base/value-object';
import { OptionId } from '@modules/features/option/types/ids/option-id';
import { OptionValueId } from '@modules/features/option/types/ids/option-value-id';

export interface ProductVariantOptionValueProps {
    optionId: OptionId;
    optionValueId: OptionValueId;
}

export interface SerializedProductVariantOptionValue {
    optionId: string;
    optionValueId: string;
}

// One option answered by one value. A variant carries one of these per option the product declares.
export class ProductVariantOptionValue extends ValueObject<ProductVariantOptionValue, SerializedProductVariantOptionValue> {
    public readonly optionId: OptionId;
    public readonly optionValueId: OptionValueId;

    public constructor({ optionId, optionValueId }: ProductVariantOptionValueProps) {
        super();
        this.optionId = optionId;
        this.optionValueId = optionValueId;
    }

    public override equals(other: ProductVariantOptionValue): boolean {
        if (!other) return false;
        return this.optionId.equals(other.optionId) && this.optionValueId.equals(other.optionValueId);
    }

    public override copy(): ProductVariantOptionValue {
        return new ProductVariantOptionValue({
            optionId: this.optionId.copy(),
            optionValueId: this.optionValueId.copy(),
        });
    }

    public override serialize(): SerializedProductVariantOptionValue {
        return {
            optionId: this.optionId.serialize(),
            optionValueId: this.optionValueId.serialize(),
        };
    }
}
