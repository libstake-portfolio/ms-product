import { ProductVariantBaseEvent, ProductVariantBaseEventProps } from './base/product-variant.base-event';

export interface ProductVariantRenamedEventProps extends ProductVariantBaseEventProps {
    name: string;
    previousName: string;
}

export class ProductVariantRenamedEvent extends ProductVariantBaseEvent<ProductVariantRenamedEventProps> {
    public constructor(props: ProductVariantRenamedEventProps) {
        super(props);
    }
}
