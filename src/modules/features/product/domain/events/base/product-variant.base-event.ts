import { ProductVariantId } from '@modules/features/product/types/ids/product-variant-id';

import { ProductBaseEvent, ProductBaseEventProps } from './product.base-event';

export interface ProductVariantBaseEventProps extends ProductBaseEventProps {
    productVariantId: ProductVariantId;
}

// A variant is not an ordering boundary of its own, so these stay grouped under the root that owns it.
export abstract class ProductVariantBaseEvent<P extends ProductVariantBaseEventProps> extends ProductBaseEvent<P> {
    protected constructor(props: P) {
        super(props);
    }

    public get productVariantId(): ProductVariantId {
        return this.props.productVariantId;
    }
}
