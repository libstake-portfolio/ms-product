import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import databaseConfig from '@configs/database.config';

type DatabaseConfig = ConfigType<typeof databaseConfig>;

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    public constructor(
        @Inject(ConfigService)
        public readonly configService: ConfigService,
    ) {}

    public createTypeOrmOptions(_connectionName?: string): TypeOrmModuleOptions {
        const options: TypeOrmModuleOptions = {
            type: 'postgres',
            replication: {
                // Reads go to a slave, writes and anything inside a transaction go to the master.
                master: {
                    host: this.configService.getOrThrow('database.master.host'),
                    port: this.configService.getOrThrow('database.master.port'),
                    username: this.configService.getOrThrow('database.master.username'),
                    password: this.configService.getOrThrow('database.master.password'),
                    database: this.configService.getOrThrow('database.master.database'),
                },
                slaves: this.configService.getOrThrow<DatabaseConfig['slaves']>('database.slaves').map(slave => ({
                    host: slave.host,
                    port: slave.port,
                    username: slave.username,
                    password: slave.password,
                    database: slave.database,
                })),
            },
            synchronize: this.configService.get('database.synchronize') || false,
            dropSchema: this.configService.get('database.dropSchema') || false,
            namingStrategy: new SnakeNamingStrategy(),
            logging: this.configService.get('database.logging') || false,
            // TODO - Implement custom logger
            logger: this.configService.get('database.logging') ? 'advanced-console' : undefined,
            entities: [join(__dirname, '../../../**/*{.orm-entity.ts,.orm-entity.js}'), join(__dirname, '../../../**/*{.view-entity.ts,.view-entity.js}'), join(__dirname, '../../../**/*{.view.ts,.view.js}')],
            migrations: [join(__dirname, 'seeds/*.seed{.js,.ts}')],
            poolSize: 20, // Default - 10
        };
        return options;
    }
}
