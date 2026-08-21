import { ProductVariantBaseEvent, ProductVariantBaseEventProps } from './base/product-variant.base-event';

export interface ProductVariantHandleChangedEventProps extends ProductVariantBaseEventProps {
    handle: string;
    previousHandle: string;
}

export class ProductVariantHandleChangedEvent extends ProductVariantBaseEvent<ProductVariantHandleChangedEventProps> {
    public constructor(props: ProductVariantHandleChangedEventProps) {
        super(props);
    }
}
