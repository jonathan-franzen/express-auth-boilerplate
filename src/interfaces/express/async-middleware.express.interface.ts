import { NextFunction, Request, Response } from 'express';

export interface AsyncMiddlewareExpressInterface {
	(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
