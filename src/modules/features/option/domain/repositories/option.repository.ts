import { OptionId } from '../../types/ids/option-id';
import { Option } from '../models/option.entity';

export const OPTION_REPOSITORY = Symbol('OPTION_REPOSITORY');

export abstract class OptionRepository {
    public abstract findById(id: OptionId): Promise<Option | null>;
    public abstract persist(entity: Option): Promise<OptionId>;
}
