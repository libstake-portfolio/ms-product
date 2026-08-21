import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { OptionId } from '../../types/ids/option-id';

export interface PurgeOptionCommandProps {
    conditions: {
        id: OptionId;
    };
}

export class PurgeOptionCommand extends TypedCommand<void> {
    public readonly props: PurgeOptionCommandProps;

    public constructor(props: PurgeOptionCommandProps) {
        super();
        this.props = props;
    }
}
