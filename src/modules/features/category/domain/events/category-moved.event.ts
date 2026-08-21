import { CategoryId } from '@modules/features/category/types/ids/category-id';

import { CategoryBaseEvent, CategoryBaseEventProps } from './base/category.base-event';

export interface CategoryMovedEventProps extends CategoryBaseEventProps {
    parentId: CategoryId | null;
    previousParentId: CategoryId | null;
    fullName: string;
    previousFullName: string;
}

export class CategoryMovedEvent extends CategoryBaseEvent<CategoryMovedEventProps> {
    public constructor(props: CategoryMovedEventProps) {
        super(props);
    }
}
