/**
 * A lightweight logger for the backend and frontend to structure output
 * and prevent swallowed errors without adding external dependencies.
 */

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private formatMessage(level: LogLevel, context: string, message: string, error?: any): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
    if (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      formatted += ` | Details: ${errMsg}`;
    }
    return formatted;
  }

  info(context: string, message: string) {
    console.info(this.formatMessage('info', context, message));
  }

  warn(context: string, message: string, error?: any) {
    console.warn(this.formatMessage('warn', context, message, error));
  }

  error(context: string, message: string, error?: any) {
    console.error(this.formatMessage('error', context, message, error));
  }
}

export const logger = new Logger();
