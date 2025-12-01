import { HttpErrorService } from '@/server/services/error/http.error.service.js'
import { PrismaErrorService } from '@/server/services/error/prisma.error.service.js'

export const httpErrorService = new HttpErrorService()
export const prismaErrorService = new PrismaErrorService()
