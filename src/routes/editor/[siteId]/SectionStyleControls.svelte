<script lang="ts">
	import type { SectionStyle } from '$lib/schema/site';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteInput from '$lib/ui/primitives/FlowbiteInput.svelte';
	import FlowbiteSelect from '$lib/ui/primitives/FlowbiteSelect.svelte';

	let {
		style,
		onupdate
	}: {
		style: SectionStyle;
		onupdate: <K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) => void;
	} = $props();

	function update<K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) {
		// The parent owns the draft mutation. `style` is intentionally a normalized
		// view object and may not be the section's persisted style reference.
		onupdate(key, value);
	}

	function updateBackground(value: string) {
		if (!value) update('backgroundColor', undefined);
		else if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
			update('backgroundColor', value);
		}
	}
</script>

<fieldset class="mb-4 rounded-[10px] border border-[var(--sk-line)] bg-white p-3">
	<legend class="px-1 text-xs font-semibold">Section design</legend>
	<p class="mb-3 text-[11px] leading-4 text-[var(--sk-muted)]">
		Change this section without asking the AI. Full width is the default for a cleaner, modern
		canvas.
	</p>
	<div class="grid grid-cols-2 gap-3">
		<label class="sk-field-stack col-span-2 sm:col-span-1">
			<span class="mb-1 text-xs">Layout</span>
			<FlowbiteSelect
				class="w-full"
				size="sm"
				value={style.layout}
				onchange={(e: Event) =>
					update('layout', (e.currentTarget as HTMLSelectElement).value as SectionStyle['layout'])}
			>
				<option value="full">Full width</option>
				<option value="boxed">Boxed</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack col-span-2 sm:col-span-1">
			<span class="mb-1 text-xs">Content width</span>
			<FlowbiteSelect
				class="w-full"
				size="sm"
				value={style.contentWidth}
				onchange={(e: Event) =>
					update(
						'contentWidth',
						(e.currentTarget as HTMLSelectElement).value as SectionStyle['contentWidth']
					)}
			>
				<option value="full">Full</option>
				<option value="wide">Wide</option>
				<option value="narrow">Narrow</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack">
			<span class="mb-1 text-xs">Vertical padding</span>
			<FlowbiteSelect
				class="w-full"
				size="sm"
				value={style.paddingY}
				onchange={(e: Event) =>
					update(
						'paddingY',
						(e.currentTarget as HTMLSelectElement).value as SectionStyle['paddingY']
					)}
			>
				<option value="compact">Compact</option>
				<option value="standard">Standard</option>
				<option value="spacious">Spacious</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack">
			<span class="mb-1 text-xs">Vertical margin</span>
			<FlowbiteSelect
				class="w-full"
				size="sm"
				value={style.marginY}
				onchange={(e: Event) =>
					update(
						'marginY',
						(e.currentTarget as HTMLSelectElement).value as SectionStyle['marginY']
					)}
			>
				<option value="none">None</option>
				<option value="compact">Compact</option>
				<option value="standard">Standard</option>
				<option value="spacious">Spacious</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack">
			<span class="mb-1 text-xs">Section height</span>
			<FlowbiteSelect
				class="w-full"
				size="sm"
				value={style.minHeight}
				onchange={(e: Event) =>
					update(
						'minHeight',
						(e.currentTarget as HTMLSelectElement).value as SectionStyle['minHeight']
					)}
			>
				<option value="auto">Content based</option>
				<option value="compact">Compact</option>
				<option value="standard">Standard</option>
				<option value="tall">Tall</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack col-span-2">
			<span class="mb-1 text-xs">Background color</span>
			<div class="flex gap-2">
				<input
					type="color"
					class="h-8 w-10 cursor-pointer rounded border border-[var(--sk-line)] bg-white p-0.5"
					value={style.backgroundColor ?? '#ffffff'}
					oninput={(e) => updateBackground(e.currentTarget.value)}
					aria-label="Background color"
				/>
				<FlowbiteInput
					type="text"
					size="sm"
					class="min-w-0 flex-1 font-mono"
					value={style.backgroundColor ?? ''}
					placeholder="Theme default"
					oninput={(e: Event) => updateBackground((e.currentTarget as HTMLInputElement).value)}
				/>
				<FlowbiteButton
					type="button"
					variant="ghost"
					size="sm"
					onclick={() => update('backgroundColor', undefined)}>Reset</FlowbiteButton
				>
			</div>
		</label>
	</div>
</fieldset>
