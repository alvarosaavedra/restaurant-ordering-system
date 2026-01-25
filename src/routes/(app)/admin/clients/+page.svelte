<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ClientCard from '$lib/components/ClientCard.svelte';
	import type { Client } from '$lib/server/db/schema';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery: string = $state('');

	let showAddClientModal: boolean = $state(false);
	let showEditClientModal: boolean = $state(false);
	let showDeleteClientModal: boolean = $state(false);

	let selectedClient: (Client & { orderCount: number }) | null = $state(null);

	let clientFormData = $state({
		id: '',
		name: '',
		phone: '',
		address: ''
	});

	let filteredClients = $derived.by(() => {
		if (!searchQuery.trim()) return data.clients;
		const query = searchQuery.toLowerCase();
		return data.clients.filter(
			(client) =>
				client.name.toLowerCase().includes(query) ||
				client.phone.toLowerCase().includes(query) ||
				client.address?.toLowerCase().includes(query)
		);
	});

	$effect(() => {
		if (form?.message) {
			closeAllModals();
		}
	});

	function handleFormSuccess() {
		closeAllModals();
		invalidateAll();
	}

	function openAddClientModal() {
		clientFormData = {
			id: '',
			name: '',
			phone: '',
			address: ''
		};
		showAddClientModal = true;
	}

	function openEditClientModal(c: Client & { orderCount: number }) {
		selectedClient = c;
		clientFormData = {
			id: c.id,
			name: c.name,
			phone: c.phone,
			address: c.address || ''
		};
		showEditClientModal = true;
	}

	function openDeleteClientModal(c: Client & { orderCount: number }) {
		selectedClient = c;
		showDeleteClientModal = true;
	}

	function closeAllModals() {
		showAddClientModal = false;
		showEditClientModal = false;
		showDeleteClientModal = false;
		selectedClient = null;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Client Management</h1>
		<p class="text-gray-600">Manage your restaurant's client database</p>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-gray-200">
		<div class="p-6">
			<div class="mb-6 flex items-center justify-between gap-4">
				<Input
					id="search"
					type="text"
					placeholder="Search clients..."
					bind:value={searchQuery}
					class="max-w-md"
					aria-label="Search clients"
				/>
				<Button onclick={openAddClientModal}>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Add Client
				</Button>
			</div>

			{#if filteredClients.length === 0}
				<div class="text-center py-12 text-gray-500">
					{searchQuery ? 'No clients found matching your search.' : 'No clients yet. Add your first client!'}
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredClients as client (client.id)}
						<ClientCard {client} onedit={openEditClientModal} ondelete={openDeleteClientModal} />
					{/each}
				</div>
			{/if}
		</div>
	</div>

	{#if form?.error}
		<div class="fixed top-4 right-4 max-w-sm p-4 bg-error-50 border border-error-200 rounded-xl shadow-lg" role="alert">
			<div class="flex items-center gap-3">
				<svg class="w-5 h-5 text-error-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="text-sm font-medium text-error-800">{form.error}</p>
			</div>
		</div>
	{/if}

	{#if form?.message}
		<div class="fixed top-4 right-4 max-w-sm p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg" role="alert">
			<div class="flex items-center gap-3">
				<svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				<p class="text-sm font-medium text-green-800">{form.message}</p>
			</div>
		</div>
	{/if}

	<Modal title="Add Client" open={showAddClientModal} onclose={closeAllModals}>
		<form method="POST" action="?/addClient" use:enhance={handleFormSuccess}>
			<div class="space-y-4">
				<Input id="name" name="name" type="text" placeholder="Client name" required bind:value={clientFormData.name} autocomplete="name" />
				<Input id="phone" name="phone" type="text" placeholder="Phone number" required bind:value={clientFormData.phone} autocomplete="tel" />
				<div>
					<label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
					<textarea
						id="address"
						name="address"
						rows="3"
						class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
						placeholder="Client address (optional)"
						bind:value={clientFormData.address}
					></textarea>
				</div>
				<div class="flex gap-3 pt-4">
					<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
					<Button type="submit">Add Client</Button>
				</div>
			</div>
		</form>
	</Modal>

	<Modal title="Edit Client" open={showEditClientModal} onclose={closeAllModals}>
		<form method="POST" action="?/updateClient" use:enhance={handleFormSuccess}>
			<input type="hidden" name="id" value={clientFormData.id} />
			<div class="space-y-4">
				<Input id="edit-name" name="name" type="text" placeholder="Client name" required bind:value={clientFormData.name} autocomplete="name" />
				<Input
					id="edit-phone"
					name="phone"
					type="text"
					placeholder="Phone number"
					required
					bind:value={clientFormData.phone}
					autocomplete="tel"
				/>
				<div>
					<label for="edit-address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
					<textarea
						id="edit-address"
						name="address"
						rows="3"
						class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
						placeholder="Client address (optional)"
						bind:value={clientFormData.address}
					></textarea>
				</div>
				<div class="flex gap-3 pt-4">
					<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
					<Button type="submit">Update Client</Button>
				</div>
			</div>
		</form>
	</Modal>

	<Modal title="Delete Client" open={showDeleteClientModal} onclose={closeAllModals}>
		<form method="POST" action="?/deleteClient" use:enhance={handleFormSuccess}>
			<input type="hidden" name="id" value={selectedClient?.id} />
			<p class="text-gray-700 mb-6">
				Are you sure you want to delete "<strong>{selectedClient?.name}</strong>"? This action cannot be undone.
			</p>
			<div class="flex gap-3 justify-end">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit" variant="danger">Delete</Button>
			</div>
		</form>
	</Modal>
</div>
