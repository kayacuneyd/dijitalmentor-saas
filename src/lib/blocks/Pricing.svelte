<script lang="ts">
  import type { BlockProps } from '$lib/blocks/registry';
  let { sectionId, props, content }: BlockProps<'pricing'> = $props();
  const variant = $derived(props.variant ?? 'cards');
  const currency = $derived(props.currency ?? '₺');
  const title = $derived(content.title);
  const intro = $derived(content.intro);
  const items = $derived(content.items);
</script>

<section id={sectionId} class="py-16 px-4" data-section-type="pricing">
  <div class="mx-auto max-w-4xl">
    {#if title}<h2 class="text-center text-2xl font-semibold tracking-tight" style="color: var(--color-primary)">{title}</h2>{/if}
    {#if intro}<p class="mx-auto mt-3 max-w-2xl text-center opacity-80">{intro}</p>{/if}
    {#if variant === 'cards'}
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each items as item}
          <div class="rounded-lg border p-6 flex flex-col gap-4 {item.highlighted ? 'ring-2 -mt-2 pb-8' : ''}" style="border-color: var(--sk-line-strong); {item.highlighted ? 'ring-color: var(--color-primary); background: var(--color-base, var(--sk-paper))' : 'background: var(--color-base, var(--sk-paper))'}">
            <div class="text-center">
              <div class="font-semibold text-lg">{item.name}</div>
              <div class="mt-2 text-3xl font-bold" style="color: var(--color-primary)">{item.price}<span class="text-sm font-normal opacity-60">/{currency}</span></div>
            </div>
            {#if item.description}<p class="text-sm text-center opacity-70">{item.description}</p>{/if}
            {#if item.features}
              <ul class="space-y-2 text-sm">
                {#each item.features as f}
                  <li class="flex gap-2"><span style="color: var(--color-accent)">✓</span> {f}</li>
                {/each}
              </ul>
            {/if}
            {#if item.highlighted}
              <button class="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white" style="background: var(--color-primary)">İletişime Geç</button>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="mt-10 overflow-x-auto">
        <table class="w-full text-sm border-collapse" style="border-color: var(--sk-line)">
          <thead><tr>{#each items as item}<th class="p-3 text-center font-semibold border-b" style="border-color: var(--sk-line)">{item.name}<div class="text-lg mt-1" style="color: var(--color-primary)">{item.price}<span class="text-xs opacity-60">/{currency}</span></div></th>{/each}</tr></thead>
          <tbody><tr>{#each items as item}<td class="p-3 text-center border-b" style="border-color: var(--sk-line)">{item.description ?? ''}</td>{/each}</tr></tbody>
        </table>
      </div>
    {/if}
  </div>
</section>
