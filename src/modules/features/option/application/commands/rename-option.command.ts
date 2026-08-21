import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { OptionId } from '../../types/ids/option-id';

export interface RenameOptionCommandProps {
    conditions: {
        id: OptionId;
    };
    payload: {
        name: string;
    };
}

export class RenameOptionCommand extends TypedCommand<void> {
    public readonly props: RenameOptionCommandProps;

    public constructor(props: RenameOptionCommandProps) {
        super();
        this.props = props;
    }
}
