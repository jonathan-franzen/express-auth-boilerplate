import process from 'node:process'

import { getAppServer } from '@/server/app.js'
import { logger } from '@/utils/logger.js'

const startServer = async () => {
  const appServer = getAppServer()

  try {
    await appServer.start()
    logger.info('Server started successfully')
  } catch (error) {
    logger.error('Failed to start the server', { error })
    process.exit(1)
  }
}

const stopServer = async () => {
  const appServer = getAppServer()

  try {
    await appServer.stop()
    logger.info('Server stopped successfully')
  } catch (error) {
    logger.error('Error during shutdown', { error })
    process.exit(1)
  }
}

void startServer()

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing Discounts API')
  await stopServer()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing Discounts API')
  await stopServer()
  process.exit(0)
})
