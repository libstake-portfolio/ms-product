import { Module } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';

import loggerConfig from '@configs/logger.config';
import { AppConfigModule } from '@modules/common/app-config/app-config.module';
import { DatabaseModule } from '@modules/common/database/database.module';
import { TransactionModule } from '@modules/common/database/transaction.module';
import { HealthModule } from '@modules/common/health/health.module';
import { ServerCqrsModule } from '@modules/common/server-cqrs/server-cqrs.module';
import { ServerLoggerModule, ServerLoggerModuleOptions } from '@modules/common/server-logger/server-logger.module';

@Module({
    imports: [
        ServerCqrsModule,
        DatabaseModule,
        TransactionModule,
        HealthModule,
        ServerLoggerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ServerLoggerModuleOptions => {
                const config = configService.getOrThrow<ConfigType<typeof loggerConfig>>('logger');
                return {
                    label: config.label,
                    console: config.console.enabled ? { level: config.console.level, richText: config.console.richText } : false,
                    files: config.file.enabled
                        ? [
                              {
                                  filename: config.file.filename,
                                  level: config.file.level,
                                  maxFilesInDay: config.file.maxFilesInDay,
                                  maxSizeInMb: config.file.maxSizeInMb,
                              },
                          ]
                        : false,
                };
            },
        }),
    ],
})
class NestedModule {}

@Module({
    imports: [
        // Update the AppConfigModule for updating configs
        AppConfigModule.forRootAsync(),

        NestedModule,
    ],
})
export class AppModule {}
