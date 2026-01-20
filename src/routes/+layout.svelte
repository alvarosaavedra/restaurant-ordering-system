<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children }: { data: any; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<style>
		.skip-link {
			position: absolute;
			top: -40px;
			left: 0;
			background: #4F46E5;
			color: white;
			padding: 8px 16px;
			text-decoration: none;
			z-index: 10000;
			transition: top 0.3s;
		}
		.skip-link:focus {
			top: 0;
		}
	</style>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to main content</a>

{@render children()}