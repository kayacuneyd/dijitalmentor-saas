<script lang="ts">
	import type { SectionStyle } from '$lib/schema/site';
	import type { DraftStore } from '$lib/stores/draft.svelte';

	let {
		style,
		store,
		onupdate
	}: {
		style: SectionStyle;
		store: DraftStore;
		onupdate?: <K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) => void;
	} = $props();

	function update<K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) {
		if (onupdate) onupdate(key, value);
		else store.update(() => { style[key] = value; });
	}

	function updateBackground(value: string) {
		if (!value) update('backgroundColor', undefined);
		else if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
			update('backgroundColor', value);
		}
	}
</script>

<fieldset class="mb-4 rounded-[10px] border border-base-300 bg-base-100 p-3">
	<legend class="px-1 text-xs font-semibold">Section design</legend>
	<p class="mb-3 text-[11px] leading-4 text-base-content/60">
		Change this section without asking the AI. Full width is the default for a cleaner, modern canvas.
	</p>
	<div class="grid grid-cols-2 gap-3">
		<label class="form-control col-span-2 sm:col-span-1">
			<span class="label-text mb-1 text-xs">Layout</span>
			<select class="select select-sm w-full" value={style.layout} onchange={(e) => update('layout', e.currentTarget.value as SectionStyle['layout'])}>
				<option value="full">Full width</option>
				<option value="boxed">Boxed</option>
			</select>
		</label>
		<label class="form-control col-span-2 sm:col-span-1">
			<span class="label-text mb-1 text-xs">Content width</span>
			<select class="select select-sm w-full" value={style.contentWidth} onchange={(e) => update('contentWidth', e.currentTarget.value as SectionStyle['contentWidth'])}>
				<option value="full">Full</option>
				<option value="wide">Wide</option>
				<option value="narrow">Narrow</option>
			</select>
		</label>
		<label class="form-control">
			<span class="label-text mb-1 text-xs">Vertical padding</span>
			<select class="select select-sm w-full" value={style.paddingY} onchange={(e) => update('paddingY', e.currentTarget.value as SectionStyle['paddingY'])}>
				<option value="compact">Compact</option>
				<option value="standard">Standard</option>
				<option value="spacious">Spacious</option>
			</select>
		</label>
		<label class="form-control">
			<span class="label-text mb-1 text-xs">Section height</span>
			<select class="select select-sm w-full" value={style.minHeight} onchange={(e) => update('minHeight', e.currentTarget.value as SectionStyle['minHeight'])}>
				<option value="auto">Content based</option>
				<option value="compact">Compact</option>
				<option value="standard">Standard</option>
				<option value="tall">Tall</option>
			</select>
		</label>
		<label class="form-control col-span-2">
			<span class="label-text mb-1 text-xs">Background color</span>
			<div class="flex gap-2">
				<input type="color" class="h-8 w-10 cursor-pointer rounded border border-base-300 bg-base-100 p-0.5" value={style.backgroundColor ?? '#ffffff'} oninput={(e) => updateBackground(e.currentTarget.value)} aria-label="Background color" />
				<input type="text" class="input input-sm min-w-0 flex-1 font-mono" value={style.backgroundColor ?? ''} placeholder="Theme default" oninput={(e) => updateBackground(e.currentTarget.value)} />
				<button type="button" class="btn btn-ghost btn-sm" onclick={() => update('backgroundColor', undefined)}>Reset</button>
			</div>
		</label>
	</div>
</fieldset>
