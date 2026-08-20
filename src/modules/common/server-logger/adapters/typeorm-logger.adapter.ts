import { Inject, Injectable } from '@nestjs/common';
import { Logger as TypeOrmLogger, ObjectLiteral } from 'typeorm';

import { ServerLogger } from '../server-logger.service';

type QueryParameters = unknown[] | ObjectLiteral;

/** Routes TypeORM's logging through the server logger. */
@Injectable()
export class ServerLoggerTypeOrmAdapter implements TypeOrmLogger {
    public constructor(
        @Inject(ServerLogger)
        private readonly logger: ServerLogger,
    ) {}

    public logQuery(query: string, parameters?: QueryParameters) {
        this.logger.debug(this.describe(query, parameters), { namespace: 'query' });
    }

    public logQueryError(error: string | Error, query: string, parameters?: QueryParameters) {
        this.logger.error(this.describe(query, parameters), error, { namespace: 'query' });
    }

    public logQuerySlow(time: number, query: string, parameters?: QueryParameters) {
        this.logger.warn(`${this.describe(query, parameters)} -- ${time}ms`, { namespace: 'query' });
    }

    public logSchemaBuild(message: string) {
        this.logger.debug(message, { namespace: 'schema' });
    }

    public logMigration(message: string) {
        this.logger.info(message, { namespace: 'migration' });
    }

    public log(level: 'log' | 'info' | 'warn', message: unknown) {
        if (level === 'warn') this.logger.warn(String(message), { namespace: 'database' });
        else this.logger.info(String(message), { namespace: 'database' });
    }

    private describe(query: string, parameters?: QueryParameters) {
        if (!parameters || Object.keys(parameters).length === 0) return query;
        return `${query} -- ${JSON.stringify(parameters)}`;
    }
}
