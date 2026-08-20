import winston, { Logform } from 'winston';

interface GetConsoleTransportOptions {
    level?: string;
    richText?: boolean;
    /** Layout to render with. */
    format: Logform.Format;
}

export const getConsoleTransport = ({ level, richText = true, format }: GetConsoleTransportOptions) => {
    return new winston.transports.Console({
        level: level,
        stderrLevels: ['error'],
        // Colorizing the level token requires running before the layout is rendered,
        // so the layout is rebuilt here on top of colorize instead of reusing the rendered line.
        format: richText ? winston.format.combine(winston.format.colorize(), format) : undefined,
    });
};
