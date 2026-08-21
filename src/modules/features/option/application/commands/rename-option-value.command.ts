import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { OptionId } from '../../types/ids/option-id';
import { OptionValueId } from '../../types/ids/option-value-id';

export interface RenameOptionValueCommandProps {
    conditions: {
        id: OptionId;
        optionValueId: OptionValueId;
    };
    payload: {
        name: string;
    };
}

export class RenameOptionValueCommand extends TypedCommand<void> {
    public readonly props: RenameOptionValueCommandProps;

    public constructor(props: RenameOptionValueCommandProps) {
        super();
        this.props = props;
    }
}
