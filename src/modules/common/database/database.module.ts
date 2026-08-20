import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseConfigService } from './database-config.service';
import { DatabaseShutdownService } from './database-shutdown.service';

export const DatabaseModule = TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useClass: DatabaseConfigService,
    extraProviders: [DatabaseShutdownService],
});
