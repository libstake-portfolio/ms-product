import { CategoryBaseEvent, CategoryBaseEventProps } from './base/category.base-event';

// The full name moves with the name because it is the name in its place, not a separate fact.
export interface CategoryRenamedEventProps extends CategoryBaseEventProps {
    name: string;
    previousName: string;
    fullName: string;
    previousFullName: string;
}

export class CategoryRenamedEvent extends CategoryBaseEvent<CategoryRenamedEventProps> {
    public constructor(props: CategoryRenamedEventProps) {
        super(props);
    }
}
