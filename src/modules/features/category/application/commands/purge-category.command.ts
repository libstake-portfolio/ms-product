import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { CategoryId } from '../../types/ids/category-id';

export interface PurgeCategoryCommandProps {
    conditions: {
        id: CategoryId;
    };
}

export class PurgeCategoryCommand extends TypedCommand<void> {
    public readonly props: PurgeCategoryCommandProps;

    public constructor(props: PurgeCategoryCommandProps) {
        super();
        this.props = props;
    }
}
