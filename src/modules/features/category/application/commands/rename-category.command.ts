import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { CategoryId } from '../../types/ids/category-id';

export interface RenameCategoryCommandProps {
    conditions: {
        id: CategoryId;
    };
    payload: {
        name: string;
    };
}

export class RenameCategoryCommand extends TypedCommand<void> {
    public readonly props: RenameCategoryCommandProps;

    public constructor(props: RenameCategoryCommandProps) {
        super();
        this.props = props;
    }
}
