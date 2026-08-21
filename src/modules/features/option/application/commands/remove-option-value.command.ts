import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { OptionId } from '../../types/ids/option-id';
import { OptionValueId } from '../../types/ids/option-value-id';

export interface RemoveOptionValueCommandProps {
    conditions: {
        id: OptionId;
        optionValueId: OptionValueId;
    };
}

export class RemoveOptionValueCommand extends TypedCommand<void> {
    public readonly props: RemoveOptionValueCommandProps;

    public constructor(props: RemoveOptionValueCommandProps) {
        super();
        this.props = props;
    }
}
