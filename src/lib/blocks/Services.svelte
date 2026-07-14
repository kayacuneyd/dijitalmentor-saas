<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'services'> = $props();

	// class names must be static strings for Tailwind to see them
	const gridCols: Record<number, string> = {
		2: 'lg:grid-cols-2',
		3: 'lg:grid-cols-3',
		4: 'lg:grid-cols-4'
	};
</script>

<section class="bg-base-200/70 px-5 py-20">
	<div class="mx-auto w-full max-w-6xl">
		<p class="text-secondary text-center font-mono text-xs font-semibold uppercase">Services</p>
		<h2 class="text-primary mt-3 text-center text-3xl leading-tight font-bold md:text-4xl">
			{content.title}
		</h2>
		{#if content.intro}
			<p class="text-base-content/70 mx-auto mt-4 max-w-2xl text-center leading-7">
				{content.intro}
			</p>
		{/if}

		{#if props.variant === 'grid'}
			<div class="mt-10 grid gap-6 sm:grid-cols-2 {gridCols[props.columns ?? 3]}">
				{#each content.items as item, i (`${item.name}-${i}`)}
					<div class="border-base-300 bg-base-100 rounded-box border p-6 shadow-sm shadow-black/5">
						<div class="bg-secondary/20 mb-5 size-10 rounded-xl"></div>
						<div>
							<h3 class="text-primary text-lg font-bold">{item.name}</h3>
							<p class="text-base-content/70 mt-2 leading-7">{item.description}</p>
							{#if item.price}
								<span
									class="border-secondary text-primary mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-semibold"
								>
									{item.price}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<ul
				class="divide-base-300 border-base-300 bg-base-100 rounded-box mt-10 divide-y border shadow-sm"
			>
				{#each content.items as item, i (`${item.name}-${i}`)}
					<li class="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h3 class="text-primary font-bold">{item.name}</h3>
							<p class="text-base-content/70 mt-1 text-sm leading-6">{item.description}</p>
						</div>
						{#if item.price}
							<span
								class="border-secondary text-primary shrink-0 rounded-full border px-3 py-1 text-sm font-semibold"
							>
								{item.price}
							</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
