import { Request, Response, NextFunction } from 'express';

export interface AsyncMiddlewareExpressInterface {
	(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
