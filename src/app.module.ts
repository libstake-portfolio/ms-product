import { Module } from '@nestjs/common';

import { AppConfigModule } from '@modules/common/app-config/app-config.module';
import { DatabaseModule } from '@modules/common/database/database.module';

@Module({
    imports: [DatabaseModule],
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
