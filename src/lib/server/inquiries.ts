import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { normalizeEmail } from '$lib/server/auth';
import { getSetting } from '$lib/server/config';
import { db } from '$lib/server/db';
import { inquiries, inquiryMessages } from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/email';
import {
	classifyLead,
	type LeadTriageCategory,
	type LeadTriageResult
} from '$lib/server/leadTriage';

export const INQUIRY_SOURCES = ['contact', 'chat', 'assistant'] as const;
export const INQUIRY_CATEGORIES = [
	'beta_access',
	'support',
	'partnership',
	'billing',
	'other'
] as const;
export const INQUIRY_STATUSES = ['open', 'pending', 'resolved', 'closed'] as const;

export type InquirySource = (typeof INQUIRY_SOURCES)[number];
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export type Inquiry = typeof inquiries.$inferSelect;
export type InquiryMessage = typeof inquiryMessages.$inferSelect;
export type InquiryDetail = Inquiry & { messages: InquiryMessage[] };
export type TriagedInquirySummary = {
	inquiry: Inquiry;
	message: string;
	triage: LeadTriageResult;
};

export class InquiryClosedError extends Error {}

const inquirySchema = z.object({
	source: z.enum(INQUIRY_SOURCES),
	name: z.string().trim().min(2).max(120),
	email: z.email().transform((value) => normalizeEmail(value)),
	category: z.enum(INQUIRY_CATEGORIES).catch('other'),
	message: z.string().trim().min(20).max(4000),
	website: z.string().trim().max(0).optional().or(z.literal('')),
	userId: z.string().nullable().optional()
});

export type InquiryInput = {
	source: unknown;
	name: unknown;
	email: unknown;
	category: unknown;
	message: unknown;
	website?: unknown;
	userId?: string | null;
};
export type InquiryValidation =
	| { ok: true; data: z.output<typeof inquirySchema> }
	| { ok: false; message: string; field?: string };

export function validateInquiry(input: InquiryInput): InquiryValidation {
	const result = inquirySchema.safeParse(input);
	if (result.success) return { ok: true, data: result.data };
	const issue = result.error.issues[0];
	const field = typeof issue?.path[0] === 'string' ? issue.path[0] : undefined;
	if (field === 'website')
		return { ok: false, field, message: 'Your message could not be accepted.' };
	if (field === 'email')
		return { ok: false, field, message: 'Please enter a valid email address.' };
	if (field === 'message') {
		return {
			ok: false,
			field,
			message: 'Please write a message between 20 and 4000 characters.'
		};
	}
	if (field === 'name') return { ok: false, field, message: 'Please enter your name.' };
	return { ok: false, field, message: 'Please check the form and try again.' };
}

export function createInquiry(input: z.output<typeof inquirySchema>): Inquiry {
	const now = new Date();
	const inquiry: Inquiry = {
		id: `inq-${randomUUID().slice(0, 10)}`,
		source: input.source,
		email: input.email,
		name: input.name,
		category: input.category,
		status: 'open',
		userId: input.userId ?? null,
		createdAt: now,
		updatedAt: now,
		lastMessageAt: now,
		lastMessageBy: 'visitor'
	};
	db.insert(inquiries).values(inquiry).run();
	db.insert(inquiryMessages)
		.values({
			id: `inqm-${randomUUID().slice(0, 10)}`,
			inquiryId: inquiry.id,
			authorKind: 'visitor',
			authorEmail: input.email,
			body: input.message,
			createdAt: now
		})
		.run();
	return inquiry;
}

export async function notifyNewInquiry(inquiry: Inquiry, body: string): Promise<void> {
	const alertEmail = getSetting('ALERT_EMAIL');
	if (!alertEmail) return;
	const triage = classifyLead({
		name: inquiry.name,
		email: inquiry.email,
		category: inquiry.category,
		message: body,
		source: inquiry.source
	});
	const result = await sendEmail({
		to: alertEmail,
		subject: `New ${inquiry.source} inquiry: ${inquiry.category}`,
		text: `${inquiry.name} <${inquiry.email}> sent a ${inquiry.category} inquiry via ${inquiry.source} (${inquiry.id}).

Triage: ${triage.category} / score ${triage.score}${triage.slaHours ? ` / SLA ${triage.slaHours}h` : ''}
Human review: ${triage.requiresHumanReview ? 'yes' : 'no'}
Reasons:
${triage.reasons.map((reason) => `- ${reason}`).join('\n')}

Draft reply:
${triage.draftReply}

Message:
${body}

Open: /admin/inbox/${inquiry.id}`
	});
	if (!result.sent) {
		console.error(`[inquiries] operator notification failed for ${inquiry.id}: ${result.error}`);
	}
}

export function listInquiries(filter?: {
	status?: InquiryStatus;
	source?: InquirySource;
}): Inquiry[] {
	const conditions = [
		filter?.status ? eq(inquiries.status, filter.status) : undefined,
		filter?.source ? eq(inquiries.source, filter.source) : undefined
	].filter(Boolean);
	const query = db.select().from(inquiries);
	const rows =
		conditions.length > 0
			? query
					.where(and(...(conditions as [ReturnType<typeof eq>, ...ReturnType<typeof eq>[]])))
					.all()
			: query.all();
	return rows.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

function listMessages(inquiryId: string): InquiryMessage[] {
	return db
		.select()
		.from(inquiryMessages)
		.where(eq(inquiryMessages.inquiryId, inquiryId))
		.orderBy(inquiryMessages.createdAt)
		.all();
}

export function getInquiryDetail(inquiryId: string): InquiryDetail | null {
	const inquiry = db.select().from(inquiries).where(eq(inquiries.id, inquiryId)).get();
	if (!inquiry) return null;
	return { ...inquiry, messages: listMessages(inquiryId) };
}

export function listTriagedInquiries(
	options: {
		limit?: number;
		categories?: LeadTriageCategory[];
	} = {}
): TriagedInquirySummary[] {
	const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
	const categorySet = options.categories ? new Set(options.categories) : null;
	return listInquiries()
		.map((inquiry) => {
			const visitorMessage =
				listMessages(inquiry.id)
					.filter((message) => message.authorKind === 'visitor')
					.at(-1)?.body ?? '';
			const triage = classifyLead({
				name: inquiry.name,
				email: inquiry.email,
				category: inquiry.category,
				source: inquiry.source,
				message: visitorMessage
			});
			return { inquiry, message: visitorMessage, triage };
		})
		.filter((item) => !categorySet || categorySet.has(item.triage.category))
		.sort((a, b) => {
			if (a.triage.score !== b.triage.score) return b.triage.score - a.triage.score;
			return b.inquiry.createdAt.getTime() - a.inquiry.createdAt.getTime();
		})
		.slice(0, limit);
}

export function addInquiryMessage(input: {
	inquiryId: string;
	authorKind: 'visitor' | 'admin';
	authorEmail: string;
	body: string;
}): InquiryMessage {
	const inquiry = db.select().from(inquiries).where(eq(inquiries.id, input.inquiryId)).get();
	if (!inquiry) throw new Error('Unknown inquiry.');
	if (inquiry.status === 'closed') throw new InquiryClosedError('This inquiry is closed.');
	const now = new Date();
	const message: InquiryMessage = {
		id: `inqm-${randomUUID().slice(0, 10)}`,
		inquiryId: input.inquiryId,
		authorKind: input.authorKind,
		authorEmail: normalizeEmail(input.authorEmail),
		body: input.body,
		createdAt: now
	};
	db.insert(inquiryMessages).values(message).run();
	db.update(inquiries)
		.set({
			status: input.authorKind === 'admin' ? 'pending' : 'open',
			updatedAt: now,
			lastMessageAt: now,
			lastMessageBy: input.authorKind
		})
		.where(eq(inquiries.id, input.inquiryId))
		.run();
	return message;
}

export function setInquiryStatus(inquiryId: string, status: InquiryStatus): void {
	db.update(inquiries)
		.set({ status, updatedAt: new Date() })
		.where(eq(inquiries.id, inquiryId))
		.run();
}

export async function sendInquiryReply(input: { inquiry: Inquiry; body: string }): Promise<void> {
	const result = await sendEmail({
		to: input.inquiry.email,
		subject: `Re: your saaskaya message`,
		text: `${input.body}\n\n— saaskaya\n\nIf you need to add context, reply to this email.`
	});
	if (!result.sent) {
		console.error(
			`[inquiries] visitor reply email failed for ${input.inquiry.id}: ${result.error}`
		);
	}
}

export function publicInquiryCounts(): { open: number; pending: number } {
	const rows = db
		.select()
		.from(inquiries)
		.where(and(eq(inquiries.status, 'open'), eq(inquiries.lastMessageBy, 'visitor')))
		.all();
	const pending = db.select().from(inquiries).where(eq(inquiries.status, 'pending')).all();
	return { open: rows.length, pending: pending.length };
}
