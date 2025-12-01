import { Prisma } from '@prisma/client'

import { logger } from '@/utils/logger.js'

interface PrismaErrorResponse {
  message: string
  statusCode: number
}

export class PrismaErrorService {
  isPrismaError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientUnknownRequestError
    )
  }

  isRecordNotExistError(err: unknown): boolean {
    return (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    )
  }

  handlePrismaError(error: unknown): PrismaErrorResponse {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2000':
          return {
            message:
              "The provided value for the column is too long for the column's type",
            statusCode: 400,
          }
        case 'P2001':
          return {
            message:
              'The record searched for in the where condition does not exist',
            statusCode: 404,
          }
        case 'P2002':
          return { message: 'Unique constraint failed', statusCode: 409 }
        case 'P2003':
          return { message: 'Foreign key constraint failed', statusCode: 400 }
        case 'P2004':
          return {
            message: 'A constraint failed on the database',
            statusCode: 400,
          }
        case 'P2005':
          return {
            message:
              "The value stored in the database for the field is invalid for the field's type",
            statusCode: 400,
          }
        case 'P2006':
          return {
            message: 'The provided value for a field is not valid',
            statusCode: 400,
          }
        case 'P2007':
          return { message: 'Data validation error', statusCode: 400 }
        case 'P2008':
          return { message: 'Failed to parse the query', statusCode: 400 }
        case 'P2009':
          return { message: 'Failed to validate the query', statusCode: 400 }
        case 'P2010':
          return { message: 'Raw query failed', statusCode: 400 }
        case 'P2011':
          return { message: 'Null constraint violation', statusCode: 400 }
        case 'P2012':
          return { message: 'Missing a required value', statusCode: 400 }
        case 'P2013':
          return { message: 'Missing the required argument', statusCode: 400 }
        case 'P2014':
          return {
            message:
              'The change you are trying to make would violate the required relation',
            statusCode: 400,
          }
        case 'P2015':
          return {
            message: 'A related record could not be found',
            statusCode: 404,
          }
        case 'P2016':
          return { message: 'Query interpretation error', statusCode: 400 }
        case 'P2017':
          return {
            message:
              'The records for relation between the parent and child models are not connected',
            statusCode: 400,
          }
        case 'P2018':
          return {
            message: 'The required connected records were not found',
            statusCode: 400,
          }
        case 'P2019':
          return { message: 'Input error', statusCode: 400 }
        case 'P2020':
          return { message: 'Value out of range for the type', statusCode: 400 }
        case 'P2021':
          return {
            message: 'The table does not exist in the current database',
            statusCode: 400,
          }
        case 'P2022':
          return {
            message: 'The column does not exist in the current database',
            statusCode: 400,
          }
        case 'P2023':
          return { message: 'Inconsistent column data', statusCode: 400 }
        case 'P2024':
          return {
            message:
              'Timed out fetching a new connection from the connection pool',
            statusCode: 500,
          }
        case 'P2025':
          return {
            message:
              'An operation failed because it depends on one or more records that were required but not found',
            statusCode: 404,
          }
        case 'P2026':
          return {
            message:
              "The current database provider doesn't support a feature that the query used",
            statusCode: 500,
          }
        case 'P2027':
          return {
            message:
              'Multiple errors occurred on the database during query execution',
            statusCode: 500,
          }
        case 'P2028':
          return { message: 'Transaction API error', statusCode: 500 }
        case 'P2030':
          return {
            message: 'Cannot find a fulltext index to use for the search',
            statusCode: 400,
          }
        case 'P2031':
          return {
            message:
              'Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set',
            statusCode: 400,
          }
        case 'P2033':
          return {
            message:
              'A number used in the query does not fit into a 64 bit signed integer',
            statusCode: 400,
          }
        case 'P2034':
          return {
            message: 'Transaction failed due to a write conflict or a deadlock',
            statusCode: 400,
          }
        default:
          logger.error('Unhandled Prisma error:', error)
          return {
            message: 'An unexpected database error occurred',
            statusCode: 500,
          }
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        message: 'The provided value for the Prisma query is invalid',
        statusCode: 500,
      }
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
      return { message: 'Internal database error', statusCode: 500 }
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        message: 'Failed to initialize database connection',
        statusCode: 500,
      }
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return { message: 'Unknown database error', statusCode: 500 }
    }

    return { message: 'An unexpected error occurred', statusCode: 500 }
  }
}
