
import dotenv from 'dotenv';

function loadConfig(){
    dotenv.config();
}

loadConfig();

type serverConfig ={
    PORT:number
    DATABASE_URL:string
    JWT_SECRET:string
    JWT_ACCESS_EXPIRES_IN:string
    JWT_REFRESH_EXPIRES_DAYS:string
}

export const configServer:serverConfig = {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL  || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_ACCESS_EXPIRES_IN : process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_DAYS: process.env.JWT_REFRESH_EXPIRES_DAYS || '7'
}