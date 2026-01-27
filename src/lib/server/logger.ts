import pino from 'pino';

const isDevelopment = import.meta.env.DEV;

const loggerOptions: pino.LoggerOptions = {
	level: isDevelopment ? 'debug' : 'info',
	formatters: {
		level: (label) => {
			return { level: label };
		}
	},
	timestamp: pino.stdTimeFunctions.isoTime
};

export const logger = pino(loggerOptions);

export function createLogger(context: Record<string, unknown>) {
	return logger.child(context);
}

export const authLogger = createLogger({ component: 'auth' });
export const orderLogger = createLogger({ component: 'orders' });
export const dbLogger = createLogger({ component: 'database' });
export const adminLogger = createLogger({ component: 'admin' });
