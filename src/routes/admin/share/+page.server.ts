import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { getSetting, setSetting } from '$lib/server/config';
import { LOCALES } from '$lib/i18n';
import {
	MAX_SHARE_VIDEO_BYTES,
	deleteShareAsset,
	listShareAssets,
	moveShareAsset,
	parseCaption,
	saveShareAssetCaption,
	setShareAssetActive,
	uploadShareAsset,
	type ShareCaption
} from '$lib/server/shareAssets';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
		assets: listShareAssets().map((asset) => ({
			...asset,
			captionByLocale: parseCaption(asset.caption)
		})),
		sharePageEnabled: getSetting('SHARE_PAGE_ENABLED') === '1'
	};
};

function captionFromForm(form: FormData): ShareCaption {
	const caption: ShareCaption = {};
	for (const locale of LOCALES) {
		const value = String(form.get(`caption_${locale}`) ?? '').trim();
		if (value) caption[locale] = value.slice(0, 200);
	}
	return caption;
}

function requiredId(form: FormData): string | null {
	const id = String(form.get('id') ?? '').trim();
	return id || null;
}

export const actions: Actions = {
	upload: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const upload = form.get('file');
		if (!(upload instanceof File) || upload.size === 0) {
			return fail(400, { message: 'Choose an image or MP4 video to upload.' });
		}
		if (upload.size > MAX_SHARE_VIDEO_BYTES) {
			return fail(413, { message: 'File must be 60 MB or smaller.' });
		}
		try {
			const asset = await uploadShareAsset({
				fileName: upload.name,
				mimeType: upload.type,
				bytes: new Uint8Array(await upload.arrayBuffer()),
				caption: captionFromForm(form)
			});
			return { uploaded: asset.fileName };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Upload failed.';
			if (message.startsWith('Upload a')) return fail(400, { message });
			return fail(503, { message: `Storage error: ${message}` });
		}
	},
	toggle: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = requiredId(form);
		if (!id) return fail(400, { message: 'Missing asset id.' });
		setShareAssetActive(id, String(form.get('active') ?? '') === '1');
		return { changed: id };
	},
	moveUp: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = requiredId(await request.formData());
		if (!id) return fail(400, { message: 'Missing asset id.' });
		moveShareAsset(id, 'up');
		return { changed: id };
	},
	moveDown: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = requiredId(await request.formData());
		if (!id) return fail(400, { message: 'Missing asset id.' });
		moveShareAsset(id, 'down');
		return { changed: id };
	},
	saveCaption: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = requiredId(form);
		if (!id) return fail(400, { message: 'Missing asset id.' });
		saveShareAssetCaption(id, captionFromForm(form));
		return { captionSaved: id };
	},
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = requiredId(await request.formData());
		if (!id) return fail(400, { message: 'Missing asset id.' });
		await deleteShareAsset(id);
		return { deleted: id };
	},
	togglePage: async ({ request, locals }) => {
		requireAdmin(locals);
		const enabled = String((await request.formData()).get('enabled') ?? '') === '1';
		setSetting('SHARE_PAGE_ENABLED', enabled ? '1' : '0');
		return { pageEnabled: enabled };
	}
};
