import { Request, Response } from 'express';

export interface ErrorHandlerMiddlewareExpressInterface {
	(err: Error, req: Request, res: Response): Response | void;
}
