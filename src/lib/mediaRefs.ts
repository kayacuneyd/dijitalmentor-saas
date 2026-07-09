/** Update a validated content object's nested media reference by editor path. */
export function setMediaRefAtPath(
	root: Record<string, unknown>,
	path: (string | number)[],
	value: string
): void {
	let cursor: unknown = root;
	for (let i = 0; i < path.length - 1; i += 1) {
		if (cursor === null || typeof cursor !== 'object') return;
		cursor = (cursor as Record<string | number, unknown>)[path[i]];
	}
	if (cursor !== null && typeof cursor === 'object' && path.length > 0) {
		(cursor as Record<string | number, unknown>)[path.at(-1)!] = value;
	}
}
