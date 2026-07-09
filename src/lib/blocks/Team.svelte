<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'team'> = $props();
</script>

<section class="bg-base-200/70 px-5 py-20">
	<div class="mx-auto w-full max-w-6xl">
		{#if content.title}
			<p class="text-secondary text-center font-mono text-xs font-semibold uppercase">Team</p>
			<h2 class="text-primary mt-3 mb-10 text-center text-3xl leading-tight font-bold md:text-4xl">
				{content.title}
			</h2>
		{/if}

		{#if props.variant === 'cards'}
			<div class="flex flex-wrap justify-center gap-6">
				{#each content.members as member (member.name)}
					<div
						class="border-base-300 bg-base-100 rounded-box w-full max-w-sm overflow-hidden border shadow-sm"
					>
						{#if member.photoUrl}
							<figure class="bg-base-300 aspect-[4/3]">
								<img src={member.photoUrl} alt={member.name} class="h-full w-full object-cover" />
							</figure>
						{/if}
						<div class="p-6">
							<h3 class="text-primary text-lg font-bold">{member.name}</h3>
							<p class="text-secondary mt-1 text-sm font-semibold">{member.role}</p>
							{#if member.bio}
								<p class="text-base-content/70 mt-3 leading-7">{member.bio}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-wrap justify-center gap-10">
				{#each content.members as member (member.name)}
					<div class="flex w-40 flex-col items-center text-center">
						{#if member.photoUrl}
							<div class="avatar">
								<div class="ring-secondary/30 bg-base-300 w-24 rounded-full ring-4">
									<img src={member.photoUrl} alt={member.name} />
								</div>
							</div>
						{/if}
						<h3 class="text-primary mt-4 font-bold">{member.name}</h3>
						<p class="text-secondary text-sm font-medium">{member.role}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
