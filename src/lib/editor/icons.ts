import {
	CheckCircleOutline,
	ClockOutline,
	CogOutline,
	DesktopPcOutline,
	FileLinesOutline,
	FileOutline,
	GlobeOutline,
	LayersOutline,
	MessagesOutline,
	MobilePhoneOutline,
	PaletteOutline,
	TabletOutline
} from 'flowbite-svelte-icons';
import type { Component } from 'svelte';

export type EditorTab =
	'Chat' | 'Structure' | 'Content' | 'Theme' | 'Pages' | 'Languages' | 'Settings';
export type Viewport = 'mobile' | 'tablet' | 'desktop';
export type EditorIcon = Component<Record<string, unknown>>;

export const tabIcons: Record<EditorTab, EditorIcon> = {
	Chat: MessagesOutline,
	Structure: LayersOutline,
	Content: FileLinesOutline,
	Theme: PaletteOutline,
	Pages: FileOutline,
	Languages: GlobeOutline,
	Settings: CogOutline
};

export const viewportIcons: Record<Viewport, EditorIcon> = {
	mobile: MobilePhoneOutline,
	tablet: TabletOutline,
	desktop: DesktopPcOutline
};

export const checkCircleIcon = CheckCircleOutline;
export const emptyCircleIcon = ClockOutline;
