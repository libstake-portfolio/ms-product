import * as process from 'node:process';

import { registerAs } from '@nestjs/config';

export default registerAs('server', () => ({
    nodeEnv: process.env.NODE_ENV || 'local',
    port: parseInt(process.env.SERVER_PORT ?? '3000', 10) || 3000,
    host: process.env.SERVER_HOST || '0.0.0.0',
}));
