import type { RequestState } from '@novin/contracts';

const allowed: Record<RequestState, readonly RequestState[]> = {
  SUBMITTED: ['UNDER_REVIEW'], UNDER_REVIEW: ['CONTACT_PENDING', 'NEED_MORE_INFO', 'REJECTED'], CONTACT_PENDING: ['QUALIFIED', 'REJECTED', 'NEED_MORE_INFO'], NEED_MORE_INFO: ['UNDER_REVIEW', 'REJECTED'], QUALIFIED: ['OFFER_SENT'], REJECTED: ['ARCHIVED'], OFFER_SENT: ['PAID', 'ARCHIVED'], PAID: ['SESSION_SCHEDULED'], SESSION_SCHEDULED: ['SESSION_COMPLETED', 'ARCHIVED'], SESSION_COMPLETED: ['PROJECT_PROPOSED', 'ARCHIVED'], PROJECT_PROPOSED: ['ARCHIVED'], ARCHIVED: []
};

export function assertTransition(from: RequestState, to: RequestState) {
  if (!allowed[from].includes(to)) throw new Error(`گذار ${from} به ${to} مجاز نیست.`);
}

export { allowed as requestTransitions };
