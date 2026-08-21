import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

// The previous handle travels with the fact so a listener holding links can redirect them.
export interface ProductHandleChangedEventProps extends ProductBaseEventProps {
    handle: string;
    previousHandle: string;
}

export class ProductHandleChangedEvent extends ProductBaseEvent<ProductHandleChangedEventProps> {
    public constructor(props: ProductHandleChangedEventProps) {
        super(props);
    }
}
