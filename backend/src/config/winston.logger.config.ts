
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getCorealtionId } from '../utils/helpers/request.helper.ts';

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    const corealtionId = getCorealtionId();
    return `${timestamp} [${corealtionId}] ${level}: ${message}`;
});

export const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new DailyRotateFile({
            filename: 'logs/Winston-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '1d'
        })
    ]
});
