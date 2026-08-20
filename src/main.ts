import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);

    const NODE_ENV = configService.get('server.nodeEnv');
    const LISTENING_PORT = configService.get('server.port');

    await app.listen(LISTENING_PORT, () => {
        /* eslint-disable no-console */
        console.log(`Server is running.`);
        console.log(`PORT "${LISTENING_PORT}" under NODE_ENV "${NODE_ENV}".`);
    });
};

bootstrap();
