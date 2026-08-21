import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

export interface ProductDescriptionRevisedEventProps extends ProductBaseEventProps {
    description: string;
    descriptionHtml: string;
}

export class ProductDescriptionRevisedEvent extends ProductBaseEvent<ProductDescriptionRevisedEventProps> {
    public constructor(props: ProductDescriptionRevisedEventProps) {
        super(props);
    }
}
