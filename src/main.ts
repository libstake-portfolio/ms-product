import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { ServerLoggerNestAdapter } from '@modules/common/server-logger/adapters/nest-logger.adapter';

import { AppModule } from './app.module';

const bootstrap = async () => {
    // Buffered so bootstrap logs are replayed through the adapter once it is available.
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
    app.useLogger(app.get(ServerLoggerNestAdapter));
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);

    const NODE_ENV = configService.get('server.nodeEnv');
    const LISTENING_PORT = configService.get('server.port');
    // Bound explicitly so the process is reachable from outside its container.
    const LISTENING_HOST = configService.get('server.host');

    await app.listen(LISTENING_PORT, LISTENING_HOST, () => {
        /* eslint-disable no-console */
        console.log(`Server is running.`);
        console.log(`Listening on "${LISTENING_HOST}:${LISTENING_PORT}" under NODE_ENV "${NODE_ENV}".`);
    });
};

bootstrap();
