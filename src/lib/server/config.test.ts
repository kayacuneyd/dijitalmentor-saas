import { describe, expect, it } from 'vitest';
import { clearSetting, getSetting, maskValue, setSetting, settingSource } from './config';

describe('settings (DB → env fallback)', () => {
	it('round-trips a DB value and reports its source', () => {
		expect(getSetting('STRIPE_PRICE_ID')).toBeUndefined();
		setSetting('STRIPE_PRICE_ID', 'price_123');
		expect(getSetting('STRIPE_PRICE_ID')).toBe('price_123');
		expect(settingSource('STRIPE_PRICE_ID')).toBe('db');
		clearSetting('STRIPE_PRICE_ID');
		expect(getSetting('STRIPE_PRICE_ID')).toBeUndefined();
		expect(settingSource('STRIPE_PRICE_ID')).toBe('');
	});

	// NOTE: the env-fallback branch (`?? env[key]`) is not unit-tested — `$env/dynamic/private`
	// snapshots the environment when Vite starts, so in-test process.env writes are invisible
	// (see the 2026-07-06 Error log entry). The DB-wins path above covers the resolution order.

	it('rejects unknown keys', () => {
		expect(() => setSetting('NOT_A_KEY', 'x')).toThrow(/unknown setting/);
		expect(() => clearSetting('NOT_A_KEY')).toThrow(/unknown setting/);
	});

	it('masks secrets but shows plain values', () => {
		expect(maskValue('sk-ant-abcdef123456', true)).toBe('••••3456');
		expect(maskValue('short', true)).toBe('••••');
		expect(maskValue('claude-opus-4-8', false)).toBe('claude-opus-4-8');
		expect(maskValue(undefined, true)).toBe('');
	});
});
