import { Request, Response, NextFunction } from 'express';

export interface SyncMiddlewareExpressInterface {
	(req: Request, res: Response, next: NextFunction): void | Response;
}
