<script lang="ts">
  import type { BlockProps } from '$lib/blocks/registry';
  let { sectionId, props, content }: BlockProps<'credentials'> = $props();
  const variant = $derived(props.variant ?? 'grid');
  const title = $derived(content.title);
  const intro = $derived(content.intro);
  const items = $derived(content.items);
</script>
<section id={sectionId} class="py-16 px-4" data-section-type="credentials">
  <div class="mx-auto max-w-4xl">
    {#if title}<h2 class="text-center text-2xl font-semibold tracking-tight" style="color: var(--color-primary)">{title}</h2>{/if}
    {#if intro}<p class="mx-auto mt-3 max-w-2xl text-center opacity-80">{intro}</p>{/if}
    {#if variant === 'grid'}
      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each items as item}
          <div class="flex items-center gap-3 rounded-lg border p-4" style="border-color: var(--sk-line-strong); background: var(--color-base, var(--sk-paper))">
            {#if item.iconUrl}<img src={item.iconUrl} alt={item.name} class="h-8 w-8 rounded object-contain" />{/if}
            <div class="text-sm">
              <div class="font-semibold">{item.name}</div>
              {#if item.issuer}<div class="opacity-70">{item.issuer}{#if item.year} · {item.year}{/if}</div>{/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="mt-10 divide-y" style="border-color: var(--sk-line)">
        {#each items as item}
          <div class="flex items-center gap-3 py-3">
            {#if item.iconUrl}<img src={item.iconUrl} alt={item.name} class="h-8 w-8 rounded object-contain" />{/if}
            <div class="text-sm"><span class="font-semibold">{item.name}</span>{#if item.issuer} — {item.issuer}{#if item.year} · {item.year}{/if}{/if}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>
