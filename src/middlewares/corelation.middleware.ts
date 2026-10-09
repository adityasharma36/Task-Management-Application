
import {v4 as uuidV4} from 'uuid'
import { asyncLocalStorage } from '../utils/helpers/request.helper.ts'
import type { NextFunction, Request, Response } from 'express'

export const attactCorelationId = (req:Request,res:Response,next:NextFunction) =>{
    const corealtionId = uuidV4();

    req.headers['x-corelation-Id']= corealtionId;

    asyncLocalStorage.run({corealtionId:corealtionId},()=>{
        next();
    })
}