import { DomainEvent } from '@common/base/domain-event';
import { CategoryId } from '@modules/features/category/types/ids/category-id';

export interface CategoryBaseEventProps {
    categoryId: CategoryId;
}

export abstract class CategoryBaseEvent<P extends CategoryBaseEventProps> extends DomainEvent {
    public readonly props: P;

    protected constructor(props: P) {
        super(props.categoryId);
        this.props = props;
    }

    public get categoryId(): CategoryId {
        return this.props.categoryId;
    }
}
