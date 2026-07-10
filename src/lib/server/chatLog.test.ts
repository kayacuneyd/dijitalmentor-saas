import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
	appendChatMessage,
	deleteChatMessages,
	listChatMessages,
	seedChatFromOnboarding
} from './chatLog';

describe('appendChatMessage / listChatMessages', () => {
	it('returns messages in chronological order', () => {
		const siteId = `site-chat-${randomUUID().slice(0, 8)}`;
		appendChatMessage({ siteId, role: 'user', kind: 'chat', body: 'first' });
		appendChatMessage({ siteId, role: 'assistant', kind: 'reply', body: 'second' });
		appendChatMessage({ siteId, role: 'user', kind: 'chat', body: 'third' });

		const rows = listChatMessages(siteId);
		expect(rows.map((r) => r.body)).toEqual(['first', 'second', 'third']);
		expect(rows.map((r) => r.role)).toEqual(['user', 'assistant', 'user']);
	});

	it('scopes messages to the given site', () => {
		const siteA = `site-chat-${randomUUID().slice(0, 8)}`;
		const siteB = `site-chat-${randomUUID().slice(0, 8)}`;
		appendChatMessage({ siteId: siteA, role: 'user', body: 'only for A' });
		expect(listChatMessages(siteB)).toHaveLength(0);
		expect(listChatMessages(siteA)).toHaveLength(1);
	});

	it('deleteChatMessages removes every row for the site', () => {
		const siteId = `site-chat-${randomUUID().slice(0, 8)}`;
		appendChatMessage({ siteId, role: 'user', body: 'a' });
		appendChatMessage({ siteId, role: 'assistant', body: 'b' });
		deleteChatMessages(siteId);
		expect(listChatMessages(siteId)).toHaveLength(0);
	});
});

describe('seedChatFromOnboarding', () => {
	it('replays each answered question as an assistant/user pair, then a closing message', () => {
		const siteId = `site-chat-${randomUUID().slice(0, 8)}`;
		seedChatFromOnboarding(siteId, {
			niche: 'psych',
			businessName: 'Ada Terapi',
			services: ['Bireysel terapi', 'Çift terapisi']
		});

		const rows = listChatMessages(siteId);
		expect(rows.every((r) => r.kind === 'onboarding_seed')).toBe(true);
		// alternating assistant(question) / user(answer) pairs, then one closing assistant message
		expect(rows.length).toBeGreaterThanOrEqual(3);
		expect(rows[rows.length - 1].role).toBe('assistant');
		expect(rows.filter((r) => r.role === 'user').map((r) => r.body)).toContain('Ada Terapi');
	});

	it('skips empty/unanswered questions and writes nothing for a fully-empty answer set', () => {
		const siteId = `site-chat-${randomUUID().slice(0, 8)}`;
		seedChatFromOnboarding(siteId, {});
		expect(listChatMessages(siteId)).toHaveLength(0);
	});
});
