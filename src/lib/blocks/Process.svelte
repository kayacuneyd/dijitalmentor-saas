<script lang="ts">
  import type { BlockProps } from '$lib/blocks/registry';
  let { sectionId, props, content }: BlockProps<'process'> = $props();
  const variant = $derived(props.variant ?? 'vertical');
  const title = $derived(content.title);
  const intro = $derived(content.intro);
  const steps = $derived(content.steps);
</script>
<section id={sectionId} class="py-16 px-4" data-section-type="process">
  <div class="mx-auto max-w-4xl">
    {#if title}<h2 class="text-center text-2xl font-semibold tracking-tight" style="color: var(--color-primary)">{title}</h2>{/if}
    {#if intro}<p class="mx-auto mt-3 max-w-2xl text-center opacity-80">{intro}</p>{/if}
    {#if variant === 'vertical'}
      <div class="mt-10 space-y-0">
        {#each steps as step, i}
          <div class="flex gap-4 pb-8 relative">
            <div class="flex flex-col items-center">
              <div class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style="background: var(--color-primary)">{i + 1}</div>
              {#if i < steps.length - 1}<div class="w-0.5 flex-1 mt-1" style="background: var(--sk-line)"></div>{/if}
            </div>
            <div class="flex-1 pt-1.5">
              <div class="font-semibold">{step.label}</div>
              <div class="mt-1 text-sm opacity-80">{step.description}</div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="mt-10 flex gap-6 overflow-x-auto pb-4">
        {#each steps as step, i}
          <div class="flex-shrink-0 w-[220px] text-center">
            <div class="flex h-10 w-10 mx-auto items-center justify-center rounded-full text-sm font-bold text-white" style="background: var(--color-primary)">{i + 1}</div>
            <div class="mt-3 font-semibold">{step.label}</div>
            <div class="mt-1 text-sm opacity-80">{step.description}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>
