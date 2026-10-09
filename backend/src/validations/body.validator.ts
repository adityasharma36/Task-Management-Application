
import type { NextFunction, Request, Response } from "express";

import type { ZodObject } from "zod";

export const bodyValidator = (schema:ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            

            await schema.parseAsync(req.body);
      
            next();
        } catch (error) {
            res.status(401).json({
                message:error
            })
        }
    };
};