import { afterEach, describe, expect, it } from 'vitest';
import { addInvite, getOrCreateUser, isBetaAllowed, listInvites, setInviteStatus } from './auth';
import { clearSetting, setSetting } from './config';
import { db } from '$lib/server/db';
import { betaInvites } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

afterEach(() => clearSetting('BETA_MODE'));

describe('closed-beta gate', () => {
	it('is open to everyone when BETA_MODE is off', () => {
		expect(isBetaAllowed('anyone@example.com')).toBe(true);
	});

	it('with BETA_MODE on, only non-revoked invited emails pass', () => {
		setSetting('BETA_MODE', '1');
		addInvite('Zeynep@Example.com', 'law');
		expect(isBetaAllowed('zeynep@example.com')).toBe(true); // normalized match
		expect(isBetaAllowed('stranger@example.com')).toBe(false);

		setInviteStatus('zeynep@example.com', 'revoked');
		expect(isBetaAllowed('zeynep@example.com')).toBe(false);

		setInviteStatus('zeynep@example.com', 'invited');
		expect(isBetaAllowed('zeynep@example.com')).toBe(true);
	});

	it('addInvite is idempotent and reactivates a revoked invite', () => {
		addInvite('dup@example.com', 'psych');
		setInviteStatus('dup@example.com', 'revoked');
		addInvite('dup@example.com', 'psych'); // re-invite
		const row = db
			.select({ status: betaInvites.status })
			.from(betaInvites)
			.where(eq(betaInvites.email, 'dup@example.com'))
			.get();
		expect(row?.status).toBe('invited');
		expect(listInvites().some((i) => i.email === 'dup@example.com')).toBe(true);
	});

	it('first sign-in flips an invite to joined', () => {
		addInvite('joiner@example.com', 'dental');
		getOrCreateUser('joiner@example.com'); // recordInviteJoin runs inside
		const row = db
			.select()
			.from(betaInvites)
			.where(eq(betaInvites.email, 'joiner@example.com'))
			.get();
		expect(row?.status).toBe('joined');
		expect(row?.joinedAt).toBeTruthy();
	});
});
