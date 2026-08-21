import { CategoryBaseEvent, CategoryBaseEventProps } from './base/category.base-event';

export interface CategoryArchivedEventProps extends CategoryBaseEventProps {}

export class CategoryArchivedEvent extends CategoryBaseEvent<CategoryArchivedEventProps> {
    public constructor(props: CategoryArchivedEventProps) {
        super(props);
    }
}
