import { NextFunction, Request, Response } from 'express';

interface AsyncMiddlewareExpressInterface {
	(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}

export default AsyncMiddlewareExpressInterface;
