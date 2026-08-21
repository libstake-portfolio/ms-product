import { CategoryBaseEvent, CategoryBaseEventProps } from './base/category.base-event';

// A descendant whose own name and parent are untouched, but whose place is spelled differently now.
export interface CategoryPathChangedEventProps extends CategoryBaseEventProps {
    fullName: string;
    previousFullName: string;
}

export class CategoryPathChangedEvent extends CategoryBaseEvent<CategoryPathChangedEventProps> {
    public constructor(props: CategoryPathChangedEventProps) {
        super(props);
    }
}
