import { CategoryBaseEvent, CategoryBaseEventProps } from './base/category.base-event';

export interface CategoryPurgedEventProps extends CategoryBaseEventProps {}

export class CategoryPurgedEvent extends CategoryBaseEvent<CategoryPurgedEventProps> {
    public constructor(props: CategoryPurgedEventProps) {
        super(props);
    }
}
