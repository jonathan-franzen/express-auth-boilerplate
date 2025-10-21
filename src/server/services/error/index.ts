import { HttpErrorService } from '@/server/services/error/http.error.service.js'
import { PrismaErrorService } from '@/server/services/error/prisma.error.service.js'

const httpErrorService = new HttpErrorService()
const prismaErrorService = new PrismaErrorService()

export { httpErrorService, prismaErrorService }
