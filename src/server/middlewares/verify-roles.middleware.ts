import { NextFunction, Request, Response } from 'express'

import { AuthenticatedRequest } from '@/types/api.types.js'
import { UserRoles } from '@/types/user.types.js'

function verifyRolesMiddleware(
  ...allowedRoles: UserRoles[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!(req as AuthenticatedRequest).user?.roles) {
      res.status(403).json({ error: 'Unauthorized.' })
    }

    const rolesArray = new Set(allowedRoles)
    const canAccess = (req as AuthenticatedRequest).user?.roles.some(
      (role: UserRoles): boolean => rolesArray.has(role)
    )

    if (!canAccess) {
      res.status(403).json({ error: 'Unauthorized.' })
    }

    return next()
  }
}

export { verifyRolesMiddleware }
