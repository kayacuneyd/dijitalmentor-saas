import { describe, expect, it } from 'vitest';
import { classify } from './kb';

describe('assistant knowledge base', () => {
	it('answers "what is saaskaya" questions in all locales', () => {
		expect(classify('saaskaya nedir?', 'tr', false).intent).toBe('what_is_saaskaya');
		expect(classify('What is saaskaya exactly?', 'en', false).intent).toBe('what_is_saaskaya');
		expect(classify('Was ist saaskaya genau?', 'de', false).intent).toBe('what_is_saaskaya');
		const reply = classify('saaskaya nedir?', 'tr', false);
		expect(reply.action).toBe('answer');
		expect(reply.reply).toContain('platform');
		expect(reply.href).toBeUndefined();
	});

	it('answers how-it-works questions', () => {
		expect(classify('Bu nasıl çalışıyor?', 'tr', false).intent).toBe('how_it_works');
		expect(classify('How does it work?', 'en', false).intent).toBe('how_it_works');
		expect(classify('Wie funktioniert das?', 'de', false).intent).toBe('how_it_works');
	});

	it('answers language questions even when the message mentions "site"', () => {
		const routed = classify('Hangi dillerde site yapabiliyorum acaba?', 'tr', false);
		expect(routed.intent).toBe('supported_languages');
		expect(routed.action).toBe('answer');
		expect(classify('Sind die Websites mehrsprachig?', 'de', false).intent).toBe(
			'supported_languages'
		);
	});

	it('routes language questions before support despite the word "support"', () => {
		expect(classify('does it support english websites', 'en', false).intent).toBe(
			'supported_languages'
		);
	});

	it('answers beta/invite questions with the beta page', () => {
		const routed = classify('Davet kodu nasıl alırım?', 'tr', false);
		expect(routed.intent).toBe('beta_status');
		expect(routed.href).toBe('/beta');
		expect(classify('How can I get early access?', 'en', false).intent).toBe('beta_status');
	});

	it('answers media/upload questions instead of treating long ones as briefs', () => {
		const routed = classify('Kendi fotoğraflarımı yükleyebilir miyim siteye?', 'tr', false);
		expect(routed.intent).toBe('editing_media');
		expect(routed.action).toBe('answer');
		expect(classify('Kann ich eigene Bilder hochladen?', 'de', false).intent).toBe('editing_media');
	});

	it('answers publishing questions', () => {
		expect(classify('Siteyi nasıl yayınlarım?', 'tr', false).intent).toBe('publishing');
		expect(classify('How do I publish and go live?', 'en', false).intent).toBe('publishing');
	});

	it('answers login/account questions with the sign-in screen', () => {
		const routed = classify('Şifremi unuttum, ne yapmalıyım?', 'tr', false);
		expect(routed.intent).toBe('account_login');
		expect(routed.href).toBe('/login');
		expect(classify('how do I log in?', 'en', false).intent).toBe('account_login');
		expect(classify('Wie kann ich mich anmelden?', 'de', false).intent).toBe('account_login');
	});

	it('matches uppercase Turkish and uppercase English input', () => {
		expect(classify('FİYAT NEDİR', 'tr', false).intent).toBe('show_pricing');
		expect(classify('WHAT IS SAASKAYA', 'en', false).intent).toBe('what_is_saaskaya');
	});

	it('keeps informational questions of 28+ characters out of onboarding', () => {
		const routed = classify('saaskaya nedir ve bana ne sağlar tam olarak?', 'tr', false);
		expect(routed.intent).toBe('what_is_saaskaya');
		expect(routed.prefill).toBeUndefined();
	});

	it('still treats long keyword-free briefs as onboarding without forcing raw prefill', () => {
		const message = 'Kadıköy’de beslenme koçuyum, randevu almak isteyen danışanlarım var';
		const routed = classify(message, 'tr', false);
		expect(routed.intent).toBe('start_onboarding');
		expect(routed.href).toBe('/new');
		expect(routed.prefill).toBeUndefined();
	});

	it('no longer routes bare mail/email mentions to domain info', () => {
		expect(classify('mail adresi alabilir miyim', 'tr', false).intent).toBe('fallback');
		expect(classify('Domain ve hosting dahil mi?', 'tr', false).intent).toBe('show_domain_info');
	});

	it('branches edit intent on session state', () => {
		const signedOut = classify('Sitemdeki hakkımda yazısını düzenle', 'tr', false);
		expect(signedOut.action).toBe('login_required');
		expect(signedOut.href).toBe('/login');
		const betaSignedOut = classify('Sitemdeki hakkımda yazısını düzenle', 'tr', false, {
			authHref: '/beta'
		});
		expect(betaSignedOut.action).toBe('login_required');
		expect(betaSignedOut.href).toBe('/beta');
		const signedIn = classify('Sitemdeki hakkımda yazısını düzenle', 'tr', true);
		expect(signedIn.action).toBe('open_dashboard');
		expect(signedIn.href).toBe('/dashboard');
	});

	it('falls back on short unrecognized input', () => {
		const routed = classify('asdfgh', 'tr', false);
		expect(routed.action).toBe('fallback');
		expect(routed.href).toBeUndefined();
	});
});
