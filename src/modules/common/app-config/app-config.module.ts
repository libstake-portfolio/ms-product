import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

import serverConfig from '@configs/server.config';

const NODE_ENVS = ['local', 'dev', 'test', 'prod'];

@Global()
@Module({})
export class AppConfigModule {
    public static async forRootAsync(options?: ConfigModuleOptions): Promise<DynamicModule> {
        return {
            module: AppConfigModule,
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [serverConfig],
                    // If use external env -- not from dotenv, set true
                    ignoreEnvFile: false,
                    envFilePath: this.resolveEnvFilePath(),
                    ...options,
                }),
            ],
        };
    }

    private static resolveEnvFilePath(): string[] {
        const nodeEnv = process.env.NODE_ENV ?? 'local';
        /* eslint-disable no-console */
        if (!process.env.NODE_ENV) console.warn('NODE_ENV is not set. Defaulting to "local".');
        if (!NODE_ENVS.includes(nodeEnv)) console.warn(`Unknown NODE_ENV "${nodeEnv}". Expected one of: ${NODE_ENVS.join(', ')}.`);

        return [`.env.${nodeEnv}`, '.env.default'];
    }
}
