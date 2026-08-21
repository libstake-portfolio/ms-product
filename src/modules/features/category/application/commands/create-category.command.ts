import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { CategoryId } from '../../types/ids/category-id';

export interface CreateCategoryCommandProps {
    payload: {
        parentId: CategoryId | null;
        name: string;
    };
}

export class CreateCategoryCommand extends TypedCommand<CategoryId> {
    public readonly props: CreateCategoryCommandProps;

    public constructor(props: CreateCategoryCommandProps) {
        super();
        this.props = props;
    }
}
