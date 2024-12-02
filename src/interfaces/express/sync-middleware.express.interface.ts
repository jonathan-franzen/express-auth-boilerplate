import { NextFunction, Request, Response } from 'express';

export interface SyncMiddlewareExpressInterface {
	(req: Request, res: Response, next: NextFunction): void | Response;
}
