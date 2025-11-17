import { NextFunction, Request, Response } from 'express'
import { z, ZodArray, ZodObject, ZodRawShape, ZodType, ZodUndefined } from 'zod'

const validateRequestMiddleware =
  (schema?: ZodObject) =>
  async (req: Request, _res?: Response, next?: NextFunction) => {
    try {
      const bodySchema = schema?.shape.body
      let strictBodySchema:
        | ZodArray<ZodType>
        | ZodObject<ZodRawShape>
        | ZodUndefined
        | ZodType

      if (!bodySchema) {
        strictBodySchema = z.union([z.undefined(), z.object({}).strict()])
      } else if (bodySchema instanceof z.ZodArray) {
        strictBodySchema = z.array(
          bodySchema.element instanceof ZodObject
            ? bodySchema.element.strict()
            : bodySchema.element
        )
      } else if ('shape' in bodySchema) {
        strictBodySchema = bodySchema.strict()
      } else {
        strictBodySchema = bodySchema
      }

      const strictSchema = z
        .object({
          body: strictBodySchema,
          query: schema?.shape.query
            ? schema.shape.query.strict()
            : z.object({}).strict(),
          params: schema?.shape.params
            ? schema.shape.params.strict()
            : z.object({}).strict(),
          cookies: schema?.shape.cookies
            ? schema.shape.cookies.strict()
            : z.object({}).strict(),
        })
        .strict()

      const result = await strictSchema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })

      if ('body' in req) {
        req.body = result.body
      }
      if ('query' in req) {
        Object.defineProperty(req, 'query', { value: result.query })
      }
      if ('params' in req) {
        req.params = result.params
      }
      if ('cookies' in req) {
        req.cookies = result.cookies
      }

      next?.()
    } catch (error) {
      next?.(error)
    }
  }

export { validateRequestMiddleware }
