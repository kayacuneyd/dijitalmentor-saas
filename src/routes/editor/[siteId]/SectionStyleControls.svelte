<script lang="ts">
	import type { SectionStyle } from '$lib/schema/site';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteInput from '$lib/ui/primitives/FlowbiteInput.svelte';
	import FlowbiteSelect from '$lib/ui/primitives/FlowbiteSelect.svelte';
	import { getTranslate } from '$lib/i18n/context';

	const t = getTranslate();

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
	<legend class="px-1 text-xs font-semibold">{t('editor.sectionStyle.title')}</legend>
	<p class="mb-3 text-[11px] leading-4 text-[var(--sk-muted)]">
		{t('editor.sectionStyle.description')}
	</p>
	<div class="grid grid-cols-2 gap-3">
		<label class="sk-field-stack col-span-2 sm:col-span-1">
			<span class="mb-1 text-xs">{t('editor.sectionStyle.layout')}</span>
			<FlowbiteSelect
				class="w-full"
				size="sm"
				value={style.layout}
				onchange={(e: Event) =>
					update('layout', (e.currentTarget as HTMLSelectElement).value as SectionStyle['layout'])}
			>
				<option value="full">{t('editor.sectionStyle.fullWidth')}</option>
				<option value="boxed">{t('editor.sectionStyle.boxed')}</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack col-span-2 sm:col-span-1">
			<span class="mb-1 text-xs">{t('editor.sectionStyle.contentWidth')}</span>
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
				<option value="full">{t('editor.sectionStyle.full')}</option>
				<option value="wide">{t('editor.sectionStyle.wide')}</option>
				<option value="narrow">{t('editor.sectionStyle.narrow')}</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack">
			<span class="mb-1 text-xs">{t('editor.sectionStyle.verticalPadding')}</span>
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
				<option value="compact">{t('editor.sectionStyle.compact')}</option>
				<option value="standard">{t('editor.sectionStyle.standard')}</option>
				<option value="spacious">{t('editor.sectionStyle.spacious')}</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack">
			<span class="mb-1 text-xs">{t('editor.sectionStyle.verticalMargin')}</span>
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
				<option value="none">{t('editor.sectionStyle.none')}</option>
				<option value="compact">{t('editor.sectionStyle.compact')}</option>
				<option value="standard">{t('editor.sectionStyle.standard')}</option>
				<option value="spacious">{t('editor.sectionStyle.spacious')}</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack">
			<span class="mb-1 text-xs">{t('editor.sectionStyle.sectionHeight')}</span>
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
				<option value="auto">{t('editor.sectionStyle.contentBased')}</option>
				<option value="compact">{t('editor.sectionStyle.compact')}</option>
				<option value="standard">{t('editor.sectionStyle.standard')}</option>
				<option value="tall">{t('editor.sectionStyle.tall')}</option>
			</FlowbiteSelect>
		</label>
		<label class="sk-field-stack col-span-2">
			<span class="mb-1 text-xs">{t('editor.sectionStyle.backgroundColor')}</span>
			<div class="flex gap-2">
				<input
					type="color"
					class="h-8 w-10 cursor-pointer rounded border border-[var(--sk-line)] bg-white p-0.5"
					value={style.backgroundColor ?? '#ffffff'}
					oninput={(e) => updateBackground(e.currentTarget.value)}
					aria-label={t('editor.sectionStyle.backgroundColor')}
				/>
				<FlowbiteInput
					type="text"
					size="sm"
					class="min-w-0 flex-1 font-mono"
					value={style.backgroundColor ?? ''}
					placeholder={t('editor.sectionStyle.themeDefault')}
					oninput={(e: Event) => updateBackground((e.currentTarget as HTMLInputElement).value)}
				/>
				<FlowbiteButton
					type="button"
					variant="ghost"
					size="sm"
					onclick={() => update('backgroundColor', undefined)}
					>{t('editor.sectionStyle.reset')}</FlowbiteButton
				>
			</div>
		</label>
	</div>
</fieldset>
