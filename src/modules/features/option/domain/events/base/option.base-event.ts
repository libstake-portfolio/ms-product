import { DomainEvent } from '@common/base/domain-event';
import { OptionId } from '@modules/features/option/types/ids/option-id';

export interface OptionBaseEventProps {
    optionId: OptionId;
}

export abstract class OptionBaseEvent<P extends OptionBaseEventProps> extends DomainEvent {
    public readonly props: P;

    protected constructor(props: P) {
        super(props.optionId);
        this.props = props;
    }

    public get optionId(): OptionId {
        return this.props.optionId;
    }
}
