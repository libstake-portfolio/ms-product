import { ProductVariantBaseEvent, ProductVariantBaseEventProps } from './base/product-variant.base-event';

export interface ProductVariantRemovedEventProps extends ProductVariantBaseEventProps {}

export class ProductVariantRemovedEvent extends ProductVariantBaseEvent<ProductVariantRemovedEventProps> {
    public constructor(props: ProductVariantRemovedEventProps) {
        super(props);
    }
}
