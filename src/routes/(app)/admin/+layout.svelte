	<script lang="ts">
		import { page } from '$app/state';

		let { children }: { children: import('svelte').Snippet } = $props();

		function isActive(href: string): boolean {
			return page.url.pathname === href;
		}
	</script>

	<div class="mb-6">
		<div class="bg-white rounded-xl shadow-sm border border-gray-200">
			<div class="flex border-b border-gray-200">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/admin/menu" class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {isActive('/admin/menu')
					? 'border-primary-600 text-primary-700'
					: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					aria-current={isActive('/admin/menu') ? 'page' : undefined}
				>
					Menu Management
				</a>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/admin/clients" class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {isActive('/admin/clients')
					? 'border-primary-600 text-primary-700'
					: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					aria-current={isActive('/admin/clients') ? 'page' : undefined}
				>
					Client Management
				</a>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/admin/reports" class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {isActive('/admin/reports')
					? 'border-primary-600 text-primary-700'
					: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					aria-current={isActive('/admin/reports') ? 'page' : undefined}
				>
					Reports
				</a>
			</div>
		</div>
</div>

{@render children()}
