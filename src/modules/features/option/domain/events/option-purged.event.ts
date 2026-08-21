import { OptionBaseEvent, OptionBaseEventProps } from './base/option.base-event';

export interface OptionPurgedEventProps extends OptionBaseEventProps {}

export class OptionPurgedEvent extends OptionBaseEvent<OptionPurgedEventProps> {
    public constructor(props: OptionPurgedEventProps) {
        super(props);
    }
}
