export default {
	apps: [
		{
			name: 'restaurant-orders',
			script: './build/index.js',
			interpreter: '/root/.bun/bin/bun',
			cwd: '/var/www/restaurant-orders',

			env: {
				NODE_ENV: 'production',
				PORT: 3000,
				DATABASE_URL: '/mnt/sqlite-data/database.db',
				ORIGIN: 'https://orders.radbug.dev'
			},

			error_file: '/var/www/restaurant-orders/logs/error.log',
			out_file: '/var/www/restaurant-orders/logs/out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			merge_logs: true,

			autorestart: true,
			max_restarts: 10,
			min_uptime: '10s',

			watch: false
		}
	]
};
