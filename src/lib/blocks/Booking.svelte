<script lang="ts">
  import type { BlockProps } from '$lib/blocks/registry';
  let { sectionId, props, content }: BlockProps<'booking'> = $props();
  const variant = $derived(props.variant ?? 'inline');
  const title = $derived(content.title);
  const subtitle = $derived(content.subtitle);
  const buttonLabel = $derived(content.buttonLabel);
  const note = $derived(content.note);
  const linkHref = $derived(props.href);
</script>
<section id={sectionId} class="py-16 px-4" style={variant === 'banner' ? 'background: var(--color-secondary)' : ''} data-section-type="booking">
  <div class="mx-auto max-w-4xl">
    {#if variant === 'inline'}
      <div class="rounded-lg border p-8 text-center" style="border-color: var(--sk-line-strong); background: var(--color-base, var(--sk-paper))">
        <h2 class="text-2xl font-semibold tracking-tight" style="color: var(--color-primary)">{title}</h2>
        {#if subtitle}<p class="mt-2 opacity-80">{subtitle}</p>{/if}
        <a href={linkHref} class="mt-4 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style="background: var(--color-primary)">{buttonLabel}</a>
        {#if note}<p class="mt-3 text-xs opacity-50">{note}</p>{/if}
      </div>
    {:else}
      <div class="text-center">
        <h2 class="text-2xl font-semibold tracking-tight" style="color: var(--color-primary)">{title}</h2>
        {#if subtitle}<p class="mt-2 opacity-80">{subtitle}</p>{/if}
        <a href={linkHref} class="mt-4 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style="background: var(--color-primary)">{buttonLabel}</a>
        {#if note}<p class="mt-3 text-xs opacity-50">{note}</p>{/if}
      </div>
    {/if}
  </div>
</section>
