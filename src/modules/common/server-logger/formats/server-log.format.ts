import winston from 'winston';

interface GetServerLogFormatOptions {
    label?: string;
}

/** Builds the single-line log layout. */
export const getServerLogFormat = ({ label }: GetServerLogFormatOptions = {}) => {
    return winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf(({ level, message, timestamp, namespace, caller, error }) => {
            const parts: unknown[] = [];
            if (label) parts.push(`[${label}]`);
            parts.push(timestamp);
            if (caller) parts.push(`[${caller}]`);
            if (namespace) parts.push(`[${namespace}]`);
            parts.push(`[${level}]`, message);
            if (error instanceof Error) parts.push(`\n${error.stack}`);
            else if (error !== undefined) parts.push(`\n${String(error)}`);
            return parts.join(' ');
        }),
    );
};
