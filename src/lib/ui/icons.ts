import {
	ArrowLeftOutline,
	ArrowRightOutline,
	ArrowUpRightFromSquareOutline,
	BarsOutline,
	ChartOutline,
	CloseOutline,
	CogOutline,
	CreditCardOutline,
	EditOutline,
	EnvelopeOutline,
	EyeOutline,
	FileLinesOutline,
	GlobeOutline,
	HomeOutline,
	InboxOutline,
	LockOutline,
	MessagesOutline,
	MinusOutline,
	PaletteOutline,
	PlusOutline,
	ShareNodesOutline,
	TrashBinOutline,
	UserOutline
} from 'flowbite-svelte-icons';

/**
 * Semantic platform icon registry.
 *
 * Flowbite owns the SVG geometry and accessibility behavior; SaasKaya callers
 * choose only the semantic role, size and surrounding control treatment.
 */
export const uiIcons = {
	arrowLeft: ArrowLeftOutline,
	arrowRight: ArrowRightOutline,
	external: ArrowUpRightFromSquareOutline,
	home: HomeOutline,
	lock: LockOutline,
	mail: EnvelopeOutline,
	menu: BarsOutline,
	message: MessagesOutline,
	user: UserOutline,
	settings: CogOutline,
	edit: EditOutline,
	minus: MinusOutline,
	plus: PlusOutline,
	x: CloseOutline,
	chart: ChartOutline,
	creditCard: CreditCardOutline,
	eye: EyeOutline,
	file: FileLinesOutline,
	globe: GlobeOutline,
	inbox: InboxOutline,
	palette: PaletteOutline,
	share: ShareNodesOutline,
	trash: TrashBinOutline
} as const;

export type PlatformIcon = (typeof uiIcons)[keyof typeof uiIcons];
