import { NextFunction, Request, Response } from 'express';

export default interface SyncMiddlewareExpressInterface {
	(req: Request, res: Response, next: NextFunction): void | Response;
}
