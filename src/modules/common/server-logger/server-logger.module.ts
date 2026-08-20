import { DynamicModule, FactoryProvider, Global, Module, ModuleMetadata, Provider } from '@nestjs/common';
import winston from 'winston';

import { ServerLoggerNestAdapter } from './adapters/nest-logger.adapter';
import { getServerLogFormat } from './formats/server-log.format';
import { LogWriter, SERVER_LOGGER_INSTANCE, ServerLogger } from './server-logger.service';
import { getConsoleTransport } from './transports/console.transport';
import { getDailyRotateFileTransport } from './transports/daily-rotate-file.transport';

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface ServerLoggerModuleOptions {
    /** Rendered at the head of every line. Omit to render no label. */
    label?: string;
    /** Omit or `false` to skip console logging. */
    console?: { level?: LogLevel; richText?: boolean } | false;
    /** One entry per file destination. Omit or `false` to skip file logging. */
    files?: { filename?: string; dirname?: string; level?: LogLevel; maxFilesInDay?: number; maxSizeInMb?: number }[] | false;
}

export interface ServerLoggerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: FactoryProvider['inject'];
    useFactory: (...args: never[]) => ServerLoggerModuleOptions | Promise<ServerLoggerModuleOptions>;
}

const createLoggerInstance = ({ label, console, files }: ServerLoggerModuleOptions): LogWriter => {
    const layout = getServerLogFormat({ label });
    const transports: winston.transport[] = [];

    if (console) transports.push(getConsoleTransport({ ...console, format: layout }));
    if (files) files.forEach(file => transports.push(getDailyRotateFileTransport(file)));

    return winston.createLogger({
        // Every destination filters by its own level, so the entry point stays fully open.
        level: 'silly',
        format: layout,
        transports,
        exitOnError: false,
    });
};

@Global()
@Module({})
export class ServerLoggerModule {
    public static forRoot(options: ServerLoggerModuleOptions = {}): DynamicModule {
        return this.build({ provide: SERVER_LOGGER_INSTANCE, useValue: createLoggerInstance(options) });
    }

    public static forRootAsync({ imports, inject, useFactory }: ServerLoggerModuleAsyncOptions): DynamicModule {
        return this.build(
            {
                provide: SERVER_LOGGER_INSTANCE,
                useFactory: async (...args: never[]) => createLoggerInstance(await useFactory(...args)),
                inject,
            },
            imports,
        );
    }

    private static build(instanceProvider: Provider, imports: ModuleMetadata['imports'] = []): DynamicModule {
        return {
            module: ServerLoggerModule,
            imports,
            providers: [instanceProvider, ServerLogger, ServerLoggerNestAdapter],
            exports: [ServerLogger, ServerLoggerNestAdapter],
        };
    }
}
