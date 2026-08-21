import { OptionBaseEvent, OptionBaseEventProps } from './base/option.base-event';

export interface OptionArchivedEventProps extends OptionBaseEventProps {}

export class OptionArchivedEvent extends OptionBaseEvent<OptionArchivedEventProps> {
    public constructor(props: OptionArchivedEventProps) {
        super(props);
    }
}
