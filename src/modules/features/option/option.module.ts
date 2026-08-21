import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { AddOptionValueHandler } from './application/commands/handlers/add-option-value.handler';
import { ArchiveOptionHandler } from './application/commands/handlers/archive-option.handler';
import { CreateOptionHandler } from './application/commands/handlers/create-option.handler';
import { PurgeOptionHandler } from './application/commands/handlers/purge-option.handler';
import { RemoveOptionValueHandler } from './application/commands/handlers/remove-option-value.handler';
import { RenameOptionValueHandler } from './application/commands/handlers/rename-option-value.handler';
import { RenameOptionHandler } from './application/commands/handlers/rename-option.handler';
import { GetOptionHandler } from './application/queries/handlers/get-option.handler';
import { OPTION_REPOSITORY } from './domain/repositories/option.repository';
import { OptionMapper } from './infrastructure/mappers/option.mapper';
import { OptionValueOrmEntity } from './infrastructure/orm-entities/option-value.orm-entity';
import { OptionOrmEntity } from './infrastructure/orm-entities/option.orm-entity';
import { OptionRepositoryImpl } from './infrastructure/repositories/option.repo-impl';

const ormEntities: EntityClassOrSchema[] = [OptionOrmEntity, OptionValueOrmEntity];
const repositories: Provider[] = [
    {
        provide: OPTION_REPOSITORY,
        useClass: OptionRepositoryImpl,
    },
];
const ormMappers: Provider[] = [OptionMapper];
const cqrsHandlers: Provider[] = [CreateOptionHandler, RenameOptionHandler, AddOptionValueHandler, RemoveOptionValueHandler, RenameOptionValueHandler, ArchiveOptionHandler, PurgeOptionHandler, GetOptionHandler];
const interfaceMappers: Provider[] = [];

@Module({
    imports: [TypeOrmModule.forFeature(ormEntities)],
    providers: [...repositories, ...ormMappers, ...cqrsHandlers, ...interfaceMappers],
    exports: [],
})
export class OptionModule {}
