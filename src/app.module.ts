import { Module } from '@nestjs/common';

import { AppConfigModule } from '@modules/common/app-config/app-config.module';

@Module({
    imports: [],
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
