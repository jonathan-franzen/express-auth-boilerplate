import { NextFunction, Request, Response } from 'express';

export default interface AsyncMiddlewareExpressInterface {
	(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
