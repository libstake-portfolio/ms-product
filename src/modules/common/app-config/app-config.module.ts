import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

import databaseConfig from '@configs/database.config';
import loggerConfig from '@configs/logger.config';
import serverConfig from '@configs/server.config';

const NODE_ENVS = ['local', 'dev', 'test', 'prod'];

// Elsewhere the runtime platform injects configuration into the process, so no file is read.
const FILE_BACKED_NODE_ENVS = ['local', 'test'];

const ENV_DIR = 'envs';

@Global()
@Module({})
export class AppConfigModule {
    public static async forRootAsync(options?: ConfigModuleOptions): Promise<DynamicModule> {
        const nodeEnv = this.resolveNodeEnv();

        return {
            module: AppConfigModule,
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [serverConfig, databaseConfig, loggerConfig],
                    ignoreEnvFile: !FILE_BACKED_NODE_ENVS.includes(nodeEnv),
                    envFilePath: this.resolveEnvFilePath(nodeEnv),
                    ...options,
                }),
            ],
        };
    }

    private static resolveNodeEnv(): string {
        const nodeEnv = process.env.NODE_ENV ?? 'local';
        /* eslint-disable no-console */
        if (!process.env.NODE_ENV) console.warn('NODE_ENV is not set. Defaulting to "local".');
        if (!NODE_ENVS.includes(nodeEnv)) console.warn(`Unknown NODE_ENV "${nodeEnv}". Expected one of: ${NODE_ENVS.join(', ')}.`);

        return nodeEnv;
    }

    // Resolved against the working directory, which the start scripts and the image both set to the project root.
    private static resolveEnvFilePath(nodeEnv: string): string[] {
        // An earlier path wins, so the environment file overrides the shared default.
        return [`${ENV_DIR}/.env.${nodeEnv}`, `${ENV_DIR}/.env.default`];
    }
}
