import morgan from "morgan";
import path from "path";
import { createStream } from "rotating-file-stream";

const logsDirectory = path.join(process.cwd(),"logs");

const accessLogStream = createStream('access.log',{
    size:"10M",
    interval:"1d",
    compress:'gzip',
    path:logsDirectory
})

export const defaultLogs = morgan('combined',{stream:accessLogStream});
export const consoleLogs = morgan('dev');