import { describe, expect, it } from 'vitest';
import { setMediaRefAtPath } from './mediaRefs';

describe('media reference paths', () => {
	it('updates a nested array image without changing adjacent content', () => {
		const content: Record<string, unknown> = {
			title: 'Gallery',
			images: [
				{ url: '/old-a.png', alt: 'A' },
				{ url: '/old-b.png', alt: 'B' }
			]
		};
		setMediaRefAtPath(content, ['images', 1, 'url'], 'https://cdn.saaskaya.com/new.png');
		expect(content).toEqual({
			title: 'Gallery',
			images: [
				{ url: '/old-a.png', alt: 'A' },
				{ url: 'https://cdn.saaskaya.com/new.png', alt: 'B' }
			]
		});
	});
});
