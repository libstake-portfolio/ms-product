import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
    // Read replicas differ from the master only by host.
    const credentials = {
        port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE_NAME,
    };

    return {
        master: { host: process.env.DATABASE_HOST ?? '127.0.0.1', ...credentials },
        // Empty means every read falls back to the master.
        slaves: (process.env.DATABASE_SLAVE_HOSTS ?? '')
            .split(',')
            .map(host => host.trim())
            .filter(Boolean)
            .map(host => ({ host, ...credentials })),
        synchronize: (process.env.DATABASE_SYNC ?? '').toLowerCase() === 'true',
        dropSchema: (process.env.DATABASE_DROP_SCHEMA ?? '').toLowerCase() === 'true',
        logging: (process.env.DATABASE_LOGGING ?? '').toLowerCase() === 'true',
    };
});
