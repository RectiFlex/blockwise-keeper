type LogLevel = 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private isProd = import.meta.env.PROD;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): LogMessage {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const formattedMessage = this.formatMessage(level, message, context);
    
    if (this.isProd) {
      // In production, we could send logs to a service like Sentry or LogRocket
      console.log(JSON.stringify(formattedMessage));
    } else {
      // In development, we'll use console methods with nice formatting
      const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      logFn(`[${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = Logger.getInstance();