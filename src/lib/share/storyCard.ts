import type { Locale } from '$lib/i18n';

const W = 1080;
const H = 1920;

const HEADLINE: Record<Locale, string> = {
	tr: 'Yayında.',
	en: 'Now live.',
	de: 'Jetzt live.'
};

const SUB: Record<Locale, string> = {
	tr: 'Yeni web sitem yayında 🎉',
	en: 'My new website is live 🎉',
	de: 'Meine neue Website ist live 🎉'
};

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

/** Shrink until the text fits maxWidth; below minSize, ellipsize. */
function fitText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxSize: number,
	minSize: number,
	weight: number
): { size: number; text: string } {
	for (let size = maxSize; size >= minSize; size -= 4) {
		ctx.font = `${weight} ${size}px Nunito, sans-serif`;
		if (ctx.measureText(text).width <= maxWidth) return { size, text };
	}
	ctx.font = `${weight} ${minSize}px Nunito, sans-serif`;
	let clipped = text;
	while (clipped.length > 4 && ctx.measureText(`${clipped}…`).width > maxWidth) {
		clipped = clipped.slice(0, -1);
	}
	return { size: minSize, text: `${clipped}…` };
}

/**
 * 1080×1920 personalized "site is live" story card, rendered fully client-side
 * (brand tokens + self-hosted fonts — no network, no cross-origin taint).
 */
export async function renderStoryCard(input: {
	siteName: string;
	liveUrl: string;
	locale: Locale;
}): Promise<File> {
	const locale: Locale = input.locale;
	await Promise.all([
		document.fonts.load('800 100px Nunito'),
		document.fonts.load('400 40px "IBM Plex Mono"'),
		document.fonts.load('600 44px "IBM Plex Mono"')
	]).catch(() => undefined);

	const canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas is not available.');

	// stone background
	const bg = ctx.createLinearGradient(0, 0, 0, H);
	bg.addColorStop(0, '#ece7dd');
	bg.addColorStop(1, '#e3ddcf');
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, W, H);

	// center card
	const cardX = 80;
	const cardY = 520;
	const cardW = W - 160;
	const cardH = 880;
	ctx.save();
	ctx.shadowColor = 'rgba(30, 20, 10, 0.28)';
	ctx.shadowBlur = 70;
	ctx.shadowOffsetY = 36;
	ctx.fillStyle = '#fbfaf7';
	roundRect(ctx, cardX, cardY, cardW, cardH, 36);
	ctx.fill();
	ctx.restore();
	ctx.strokeStyle = 'rgba(23, 22, 20, 0.1)';
	ctx.lineWidth = 2;
	roundRect(ctx, cardX, cardY, cardW, cardH, 36);
	ctx.stroke();

	// brand mark above the card
	ctx.fillStyle = '#171614';
	roundRect(ctx, cardX, 320, 96, 96, 24);
	ctx.fill();
	ctx.fillStyle = '#f3ecdd';
	ctx.font = '800 60px Nunito, sans-serif';
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';
	ctx.fillText('s', cardX + 48, 320 + 54);
	ctx.textAlign = 'left';
	ctx.fillStyle = '#171614';
	ctx.font = '800 56px Nunito, sans-serif';
	ctx.fillText('saaskaya', cardX + 124, 320 + 50);

	const centerX = W / 2;
	ctx.textAlign = 'center';

	// sub line ("My new website is live 🎉")
	ctx.fillStyle = 'rgba(23, 22, 20, 0.62)';
	ctx.font = '600 44px Nunito, sans-serif';
	ctx.fillText(SUB[locale], centerX, cardY + 150);

	// headline
	ctx.fillStyle = '#171614';
	ctx.font = '800 132px Nunito, sans-serif';
	ctx.fillText(HEADLINE[locale], centerX, cardY + 300);

	// gold rule
	ctx.fillStyle = '#d9a441';
	roundRect(ctx, centerX - 90, cardY + 380, 180, 10, 999);
	ctx.fill();

	// site name (shrink-to-fit)
	const name = fitText(ctx, input.siteName.trim() || 'saaskaya', cardW - 140, 88, 48, 800);
	ctx.fillStyle = '#171614';
	ctx.font = `800 ${name.size}px Nunito, sans-serif`;
	ctx.fillText(name.text, centerX, cardY + 510);

	// live URL pill (mono on ink)
	const urlText = input.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
	let urlSize = 44;
	ctx.font = `600 ${urlSize}px "IBM Plex Mono", monospace`;
	while (urlSize > 26 && ctx.measureText(urlText).width > cardW - 220) {
		urlSize -= 2;
		ctx.font = `600 ${urlSize}px "IBM Plex Mono", monospace`;
	}
	const pillW = ctx.measureText(urlText).width + 120;
	const pillH = 110;
	const pillY = cardY + 610;
	ctx.fillStyle = '#171614';
	roundRect(ctx, centerX - pillW / 2, pillY, pillW, pillH, 999);
	ctx.fill();
	ctx.fillStyle = '#f3ecdd';
	ctx.fillText(urlText, centerX, pillY + pillH / 2 + 2);

	// bottom badge
	ctx.fillStyle = 'rgba(23, 22, 20, 0.45)';
	ctx.font = '400 34px "IBM Plex Mono", monospace';
	ctx.fillText('powered by saaskaya · saaskaya.com', centerX, H - 180);

	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
	if (!blob) throw new Error('Could not render the story card.');
	const slug = urlText.split('.')[0].replace(/[^\w-]/g, '') || 'site';
	return new File([blob], `${slug}-story.png`, { type: 'image/png' });
}
