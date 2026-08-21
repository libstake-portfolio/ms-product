import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

// Tells downstream to release what it holds; the product is not gone yet.
export interface ProductArchivedEventProps extends ProductBaseEventProps {}

export class ProductArchivedEvent extends ProductBaseEvent<ProductArchivedEventProps> {
    public constructor(props: ProductArchivedEventProps) {
        super(props);
    }
}
