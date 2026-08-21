import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { CategoryId } from '../../types/ids/category-id';

export interface MoveCategoryCommandProps {
    conditions: {
        id: CategoryId;
    };
    payload: {
        parentId: CategoryId | null;
    };
}

export class MoveCategoryCommand extends TypedCommand<void> {
    public readonly props: MoveCategoryCommandProps;

    public constructor(props: MoveCategoryCommandProps) {
        super();
        this.props = props;
    }
}
