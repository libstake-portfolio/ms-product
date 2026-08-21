import { DomainEvent } from '@common/base/domain-event';
import { ProductId } from '@modules/features/product/types/ids/product-id';

export interface ProductBaseEventProps {
    productId: ProductId;
}

export abstract class ProductBaseEvent<P extends ProductBaseEventProps> extends DomainEvent {
    public readonly props: P;

    protected constructor(props: P) {
        super(props.productId);
        this.props = props;
    }

    public get productId(): ProductId {
        return this.props.productId;
    }
}
