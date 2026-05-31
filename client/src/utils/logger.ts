class Logger {
  private static instance: Logger
  private logs: any[] = []
  private maxLogs = 1000

  private constructor() {
    // Initialize error tracking
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleError.bind(this))
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: string, message: string, context?: any): any {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }
  }

  private addLog(log: any) {
    this.logs.push(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // In development, also log to console
    if (import.meta.env.DEV) {
      switch (log.level) {
        case 'error':
          console.error(log.message, log.context || '')
          break
        case 'warn':
          console.warn(log.message, log.context || '')
          break
        case 'info':
          console.info(log.message, log.context || '')
          break
        default:
          console.log(log.message, log.context || '')
      }
    }

    // Send to server in production
    if (import.meta.env.PROD && (log.level === 'error' || log.level === 'warn')) {
      this.sendToServer(log)
    }
  }

  private async sendToServer(log: any) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      })
    } catch (error) {
      console.error('Failed to send log to server:', error)
    }
  }

  private handleError(event: ErrorEvent) {
    this.error('Unhandled Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
    })
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    this.error('Unhandled Promise Rejection', {
      reason: event.reason,
    })
  }

  info(message: string, context?: any) {
    const log = this.formatMessage('info', message, context)
    this.addLog(log)
  }

  warn(message: string, context?: any) {
    const log = this.formatMessage('warn', message, context)
    this.addLog(log)
  }

  error(message: string, context?: any) {
    const log = this.formatMessage('error', message, context)
    this.addLog(log)
  }

  debug(message: string, context?: any) {
    const log = this.formatMessage('debug', message, context)
    this.addLog(log)
  }

  // Log user actions
  logAction(action: string, details?: any) {
    this.info(`User Action: ${action}`, details)
  }

  // Log API calls
  logApiCall(method: string, url: string, details?: any) {
    this.debug(`API Call: ${method} ${url}`, details)
  }

  // Log errors with context
  logError(error: Error, context?: any) {
    this.error(error.message, {
      stack: error.stack,
      ...context,
    })
  }

  // Get all logs (for debugging)
  getLogs(): any[] {
    return [...this.logs]
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export convenience functions
export const logInfo = (message: string, context?: any) => logger.info(message, context)
export const logWarn = (message: string, context?: any) => logger.warn(message, context)
export const logError = (message: string, context?: any) => logger.error(message, context)
export const logDebug = (message: string, context?: any) => logger.debug(message, context)
export const logAction = (action: string, details?: any) => logger.logAction(action, details)

export default logger
