import { ProductVariantOptionValue } from '../models/product-variant-option-value.value-object';

import { ProductVariantBaseEvent, ProductVariantBaseEventProps } from './base/product-variant.base-event';

// The selections arrive in the product's declared option order so a listener renders them the same way twice.
export interface ProductVariantAddedEventProps extends ProductVariantBaseEventProps {
    handle: string;
    name: string;
    optionValues: ProductVariantOptionValue[];
}

export class ProductVariantAddedEvent extends ProductVariantBaseEvent<ProductVariantAddedEventProps> {
    public constructor(props: ProductVariantAddedEventProps) {
        super(props);
    }
}
