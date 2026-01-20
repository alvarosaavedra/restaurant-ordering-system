export interface AutoRefreshOptions {
	intervalMs?: number;
	onRefresh: () => void | Promise<void>;
	onLastUpdated?: (value: Date | null) => void;
}

export class AutoRefresh {
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private intervalMs: number;
	private onRefresh: AutoRefreshOptions['onRefresh'];
	private onLastUpdated: AutoRefreshOptions['onLastUpdated'];
	private isRefreshing = false;
	private onIsRefreshingChange: (value: boolean) => void;

	constructor(options: AutoRefreshOptions, setIsRefreshing: (value: boolean) => void) {
		const { intervalMs = 30000, onRefresh, onLastUpdated } = options;
		this.intervalMs = intervalMs;
		this.onRefresh = onRefresh;
		this.onLastUpdated = onLastUpdated;
		this.onIsRefreshingChange = setIsRefreshing;
	}

	start() {
		if (this.intervalId) return;

		const initialFetch = async () => {
			this.setIsRefreshing(true);
			try {
				await this.onRefresh?.();
				this.onLastUpdated?.(new Date());
			} finally {
				this.setIsRefreshing(false);
			}
		};

		initialFetch();

		this.intervalId = setInterval(async () => {
			if (!this.isRefreshing) {
				this.setIsRefreshing(true);
				try {
					await this.onRefresh?.();
					this.onLastUpdated?.(new Date());
				} finally {
					this.setIsRefreshing(false);
				}
			}
		}, this.intervalMs);
	}

	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	async refresh() {
		if (!this.isRefreshing) {
			this.setIsRefreshing(true);
			try {
				await this.onRefresh?.();
				this.onLastUpdated?.(new Date());
			} finally {
				this.setIsRefreshing(false);
			}
		}
	}

	private setIsRefreshing(value: boolean) {
		this.isRefreshing = value;
		this.onIsRefreshingChange(value);
	}
}

export function createAutoRefresh(
	options: AutoRefreshOptions,
	setIsRefreshing: (value: boolean) => void
): AutoRefresh {
	return new AutoRefresh(options, setIsRefreshing);
}
