m<script lang="ts">
  import type { BlockProps } from '$lib/blocks/registry';

  let { sectionId, props, content }: BlockProps<'testimonials'> = $props();

  const variant = $derived(props.variant ?? 'grid');
  const title = $derived(content.title);
  const intro = $derived(content.intro);
  const items = $derived(content.items);

  function stars(rating: number | undefined, max = 5): string {
    if (rating == null) return '';
    return '★'.repeat(Math.min(rating, max)) + '☆'.repeat(Math.max(max - rating, 0));
  }
</script>

<section id={sectionId} class="py-16 px-4" data-section-type="testimonials">
  <div class="mx-auto max-w-4xl">
    {#if title}
      <h2 class="text-center text-2xl font-semibold tracking-tight" style="color: var(--color-primary)">
        {title}
      </h2>
    {/if}
    {#if intro}
      <p class="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed opacity-80">
        {intro}
      </p>
    {/if}

    {#if variant === 'grid'}
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each items as item}
          <div
            class="flex flex-col gap-3 rounded-lg border p-5 transition-shadow hover:shadow-md"
            style="border-color: var(--sk-line-strong); background: var(--color-base, var(--sk-paper))"
          >
            {#if item.rating != null}
              <div class="text-lg tracking-wider" style="color: var(--color-accent)" aria-label="{item.rating}/5">
                {stars(item.rating)}
              </div>
            {/if}
            <blockquote class="flex-1 text-sm leading-relaxed opacity-80">
              " {item.quote} "
            </blockquote>
            <div class="flex items-center gap-3 border-t pt-3" style="border-color: var(--sk-line)">
              {#if item.avatarUrl}
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  class="h-9 w-9 rounded-full object-cover"
                  loading="lazy"
                />
              {:else}
                <span
                  class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                  style="background: var(--color-secondary); color: var(--color-primary)"
                >
                  {item.name.charAt(0)}
                </span>
              {/if}
              <div class="text-sm">
                <div class="font-semibold">{item.name}</div>
                {#if item.role}
                  <div class="text-xs opacity-60">{item.role}</div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if variant === 'carousel'}
      <div class="mt-10 overflow-x-auto pb-4">
        <div class="inline-flex gap-6">
          {#each items as item}
            <div
              class="w-[300px] flex-shrink-0 flex flex-col gap-3 rounded-lg border p-5"
              style="border-color: var(--sk-line-strong); background: var(--color-base, var(--sk-paper))"
            >
              {#if item.rating != null}
                <div class="text-lg tracking-wider" style="color: var(--color-accent)" aria-label="{item.rating}/5">
                  {stars(item.rating)}
                </div>
              {/if}
              <blockquote class="flex-1 text-sm leading-relaxed opacity-80">
                " {item.quote} "
              </blockquote>
              <div class="flex items-center gap-3 border-t pt-3" style="border-color: var(--sk-line)">
                {#if item.avatarUrl}
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    class="h-9 w-9 rounded-full object-cover"
                    loading="lazy"
                  />
                {:else}
                  <span
                    class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                    style="background: var(--color-secondary); color: var(--color-primary)"
                  >
                    {item.name.charAt(0)}
                  </span>
                {/if}
                <div class="text-sm">
                  <div class="font-semibold">{item.name}</div>
                  {#if item.role}
                    <div class="text-xs opacity-60">{item.role}</div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>