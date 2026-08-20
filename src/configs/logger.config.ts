import { registerAs } from '@nestjs/config';

import { LogLevel } from '@modules/common/server-logger/server-logger.module';

export default registerAs('logger', () => ({
    label: process.env.LOGGER_LABEL || 'Server',
    console: {
        enabled: (process.env.LOGGER_CONSOLE_ENABLED ?? 'true').toLowerCase() === 'true',
        level: (process.env.LOGGER_CONSOLE_LEVEL || 'silly') as LogLevel,
        richText: (process.env.LOGGER_CONSOLE_RICH_TEXT ?? 'true').toLowerCase() === 'true',
    },
    file: {
        enabled: (process.env.LOGGER_FILE_ENABLED ?? '').toLowerCase() === 'true',
        filename: process.env.LOGGER_FILE_NAME || 'server',
        level: (process.env.LOGGER_FILE_LEVEL || 'silly') as LogLevel,
        maxFilesInDay: parseInt(process.env.LOGGER_FILE_MAX_FILES_IN_DAY ?? '20', 10),
        maxSizeInMb: parseInt(process.env.LOGGER_FILE_MAX_SIZE_IN_MB ?? '14', 10),
    },
}));
