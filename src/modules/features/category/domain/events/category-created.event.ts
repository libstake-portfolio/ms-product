import { CategoryId } from '@modules/features/category/types/ids/category-id';

import { CategoryBaseEvent, CategoryBaseEventProps } from './base/category.base-event';

export interface CategoryCreatedEventProps extends CategoryBaseEventProps {
    parentId: CategoryId | null;
    name: string;
    fullName: string;
}

export class CategoryCreatedEvent extends CategoryBaseEvent<CategoryCreatedEventProps> {
    public constructor(props: CategoryCreatedEventProps) {
        super(props);
    }
}
