import { OptionValueId } from '@modules/features/option/types/ids/option-value-id';

import { OptionBaseEvent, OptionBaseEventProps } from './option.base-event';

export interface OptionValueBaseEventProps extends OptionBaseEventProps {
    optionValueId: OptionValueId;
}

// A value is not an ordering boundary of its own, so these stay grouped under the option that owns it.
export abstract class OptionValueBaseEvent<P extends OptionValueBaseEventProps> extends OptionBaseEvent<P> {
    protected constructor(props: P) {
        super(props);
    }

    public get optionValueId(): OptionValueId {
        return this.props.optionValueId;
    }
}
