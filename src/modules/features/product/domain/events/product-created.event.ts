import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

export interface ProductCreatedEventProps extends ProductBaseEventProps {}

export class ProductCreatedEvent extends ProductBaseEvent<ProductCreatedEventProps> {
    public constructor(props: ProductCreatedEventProps) {
        super(props);
    }
}
