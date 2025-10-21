import { Response } from 'express'

import {
  DataResponse,
  ErrorResponse,
  MessageResponse,
  PaginationResponse,
} from '@/types/api/response.types.js'

type PayloadVariant = 'empty' | 'message' | 'data' | 'pagination' | 'error'

type PayloadVariantMap<T> = {
  empty: undefined
  message: MessageResponse
  data: DataResponse<T>
  pagination: PaginationResponse<T>
  error: ErrorResponse
}

export function sendResponse<K extends PayloadVariant = 'empty', T = never>(
  res: Response,
  status: number,
  payload: PayloadVariantMap<T>[K]
): Response<PayloadVariantMap<T>[K]> {
  if (!payload) {
    return res.sendStatus(status)
  }

  const message =
    payload.message ??
    ('data' in payload && Array.isArray(payload.data)
      ? payload.data.length < 1
        ? 'No items found.'
        : 'Success.'
      : status < 300
        ? 'Success.'
        : 'Internal Server Error.')

  if ('error' in payload) {
    return res.status(status).json({ message, error: payload.error })
  }

  if ('count' in payload) {
    return res.status(status).json({
      message,
      data: payload.data,
      count: payload.count,
      pageSize: payload.pageSize,
      page: payload.page,
    })
  }

  if ('data' in payload) {
    return res.status(status).json({ message, data: payload.data })
  }

  return res.status(status).json({ message })
}
