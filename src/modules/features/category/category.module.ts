import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { ArchiveCategoryHandler } from './application/commands/handlers/archive-category.handler';
import { CreateCategoryHandler } from './application/commands/handlers/create-category.handler';
import { MoveCategoryHandler } from './application/commands/handlers/move-category.handler';
import { PurgeCategoryHandler } from './application/commands/handlers/purge-category.handler';
import { RenameCategoryHandler } from './application/commands/handlers/rename-category.handler';
import { GetCategoryHandler } from './application/queries/handlers/get-category.handler';
import { CategoryTree } from './application/services/category-tree.service';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository';
import { CategoryMapper } from './infrastructure/mappers/category.mapper';
import { CategoryOrmEntity } from './infrastructure/orm-entities/category.orm-entity';
import { CategoryRepositoryImpl } from './infrastructure/repositories/category.repo-impl';

const ormEntities: EntityClassOrSchema[] = [CategoryOrmEntity];
const repositories: Provider[] = [
    {
        provide: CATEGORY_REPOSITORY,
        useClass: CategoryRepositoryImpl,
    },
];
const ormMappers: Provider[] = [CategoryMapper];
const applicationServices: Provider[] = [CategoryTree];
const cqrsHandlers: Provider[] = [CreateCategoryHandler, RenameCategoryHandler, MoveCategoryHandler, ArchiveCategoryHandler, PurgeCategoryHandler, GetCategoryHandler];
const interfaceMappers: Provider[] = [];

@Module({
    imports: [TypeOrmModule.forFeature(ormEntities)],
    providers: [...repositories, ...ormMappers, ...applicationServices, ...cqrsHandlers, ...interfaceMappers],
    exports: [],
})
export class CategoryModule {}
