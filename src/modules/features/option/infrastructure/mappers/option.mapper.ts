import { RelationNotLoadedException } from '@common/errors/relation-not-loaded.exception';

import { OptionValue } from '../../domain/models/option-value.entity';
import { Option } from '../../domain/models/option.entity';
import { OptionId } from '../../types/ids/option-id';
import { OptionValueId } from '../../types/ids/option-value-id';
import { OptionValueOrmEntity } from '../orm-entities/option-value.orm-entity';
import { OptionOrmEntity } from '../orm-entities/option.orm-entity';

export class OptionMapper {
    public toDomainEntity(ormEntity: OptionOrmEntity): Option {
        if (!ormEntity.optionValues) throw new RelationNotLoadedException(OptionOrmEntity.name, 'optionValues');
        return Option.reconstitute({
            id: new OptionId(ormEntity.id),
            name: ormEntity.name,
            optionValues: ormEntity.optionValues.map(optionValue => this.toOptionValueDomainEntity(optionValue)),
        });
    }

    public toOrmEntity(entity: Option): OptionOrmEntity {
        return new OptionOrmEntity({
            id: entity.id.serialize(),
            name: entity.name,
        });
    }

    public toOptionValueDomainEntity(ormEntity: OptionValueOrmEntity): OptionValue {
        return OptionValue.reconstitute({
            id: new OptionValueId(ormEntity.id),
            name: ormEntity.name,
        });
    }

    public toOptionValueOrmEntity(entity: OptionValue, optionId: OptionId): OptionValueOrmEntity {
        return new OptionValueOrmEntity({
            id: entity.id.serialize(),
            optionId: optionId.serialize(),
            name: entity.name,
        });
    }
}
