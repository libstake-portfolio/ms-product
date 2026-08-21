import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { CreateProductHandler } from './application/commands/handlers/create-product.handler';
import { GetProductHandler } from './application/queries/handlers/get-product.handler';
import { ProductSaga } from './application/sagas/product.saga';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository';
import { ProductMapper } from './infrastructure/mappers/product.mapper';
import { ProductRepositoryImpl } from './infrastructure/repositories/product.repo-impl';

const ormEntities: EntityClassOrSchema[] = [];
const repositories: Provider[] = [
    {
        provide: PRODUCT_REPOSITORY,
        useClass: ProductRepositoryImpl,
    },
];
const ormMappers: Provider[] = [ProductMapper];
const cqrsHandlers: Provider[] = [CreateProductHandler, GetProductHandler];
const interfaceMappers: Provider[] = [];
const sagas: Provider[] = [ProductSaga];

@Module({
    imports: [TypeOrmModule.forFeature(ormEntities)],
    providers: [...repositories, ...ormMappers, ...cqrsHandlers, ...interfaceMappers, ...sagas],
    exports: [],
})
export class ProductModule {}
