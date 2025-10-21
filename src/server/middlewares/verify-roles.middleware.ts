import { Role } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

import { AuthenticatedRequest } from '@/types/api/request.types.js'

function verifyRolesMiddleware(
  ...allowedRoles: Role[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!(req as AuthenticatedRequest).user?.roles) {
      res.status(403).json({ error: 'Unauthorized.' })
    }

    const rolesArray = new Set(allowedRoles)
    const canAccess = (req as AuthenticatedRequest).user?.roles.some(
      (role: Role): boolean => rolesArray.has(role)
    )

    if (!canAccess) {
      res.status(403).json({ error: 'Unauthorized.' })
    }

    return next()
  }
}

export { verifyRolesMiddleware }
