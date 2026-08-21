import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { CategoryId } from '../../types/ids/category-id';

export interface ArchiveCategoryCommandProps {
    conditions: {
        id: CategoryId;
    };
}

export class ArchiveCategoryCommand extends TypedCommand<void> {
    public readonly props: ArchiveCategoryCommandProps;

    public constructor(props: ArchiveCategoryCommandProps) {
        super();
        this.props = props;
    }
}
