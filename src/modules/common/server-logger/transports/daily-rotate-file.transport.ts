import winston from 'winston';
// Registers DailyRotateFile on winston.transports.
import 'winston-daily-rotate-file';

interface GetDailyRotateFileTransportOptions {
    /** Base name; the rotation date and extension are appended. */
    filename?: string;
    dirname?: string;
    level?: string;
    maxFilesInDay?: number;
    maxSizeInMb?: number;
}

export const getDailyRotateFileTransport = ({ filename = 'server', dirname = 'logs', maxFilesInDay = 20, maxSizeInMb = 14, level }: GetDailyRotateFileTransportOptions = {}) => {
    return new winston.transports.DailyRotateFile({
        filename: `${dirname}/${filename}_%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: `${maxSizeInMb}m`,
        maxFiles: `${maxFilesInDay}d`,
        level: level,
    });
};
