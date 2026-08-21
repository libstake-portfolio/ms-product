import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

export interface ProductRenamedEventProps extends ProductBaseEventProps {
    name: string;
    previousName: string;
}

export class ProductRenamedEvent extends ProductBaseEvent<ProductRenamedEventProps> {
    public constructor(props: ProductRenamedEventProps) {
        super(props);
    }
}
