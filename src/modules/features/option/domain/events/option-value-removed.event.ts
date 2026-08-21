import { OptionValueBaseEvent, OptionValueBaseEventProps } from './base/option-value.base-event';

export interface OptionValueRemovedEventProps extends OptionValueBaseEventProps {}

export class OptionValueRemovedEvent extends OptionValueBaseEvent<OptionValueRemovedEventProps> {
    public constructor(props: OptionValueRemovedEventProps) {
        super(props);
    }
}
