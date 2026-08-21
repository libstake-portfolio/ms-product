import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

export interface ProductPurgedEventProps extends ProductBaseEventProps {}

export class ProductPurgedEvent extends ProductBaseEvent<ProductPurgedEventProps> {
    public constructor(props: ProductPurgedEventProps) {
        super(props);
    }
}
