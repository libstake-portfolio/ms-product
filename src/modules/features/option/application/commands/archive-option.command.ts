import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { OptionId } from '../../types/ids/option-id';

export interface ArchiveOptionCommandProps {
    conditions: {
        id: OptionId;
    };
}

export class ArchiveOptionCommand extends TypedCommand<void> {
    public readonly props: ArchiveOptionCommandProps;

    public constructor(props: ArchiveOptionCommandProps) {
        super();
        this.props = props;
    }
}
