import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

const id = () => uuid('id').defaultRandom().primaryKey();
const createdAt = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).defaultNow().notNull();

export const organizationType = pgEnum('organization_type', ['PRIVATE', 'PUBLIC', 'GOVERNMENT']);
export const staffRole = pgEnum('staff_role', ['CUSTOMER', 'EXPERT', 'OPERATIONS', 'FINANCE', 'CONTENT', 'SUPERADMIN']);
export const requestState = pgEnum('request_state', ['SUBMITTED', 'UNDER_REVIEW', 'CONTACT_PENDING', 'NEED_MORE_INFO', 'QUALIFIED', 'REJECTED', 'OFFER_SENT', 'PAID', 'SESSION_SCHEDULED', 'SESSION_COMPLETED', 'PROJECT_PROPOSED', 'ARCHIVED']);
export const offerState = pgEnum('offer_state', ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'EXPIRED', 'REVOKED']);
export const orderState = pgEnum('order_state', ['DRAFT', 'PAYMENT_PENDING', 'PAID', 'CANCELLED', 'REFUNDED']);
export const paymentState = pgEnum('payment_state', ['INITIATED', 'REDIRECTED', 'VERIFIED', 'FAILED', 'REVERSED']);
export const bankTransferState = pgEnum('bank_transfer_state', ['SUBMITTED', 'REVIEW_PENDING', 'CONFIRMED', 'REJECTED']);
export const notificationChannel = pgEnum('notification_channel', ['SMS', 'EMAIL']);
export const publicationState = pgEnum('publication_state', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const users = pgTable('users', {
  id: id(),
  mobile: varchar('mobile', { length: 16 }).notNull().unique(),
  firstName: varchar('first_name', { length: 80 }),
  lastName: varchar('last_name', { length: 80 }),
  email: varchar('email', { length: 254 }),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  jobTitle: varchar('job_title', { length: 120 }),
  role: staffRole('role').notNull().default('CUSTOMER'),
  active: boolean('active').notNull().default(true),
  mfaEnrolledAt: timestamp('mfa_enrolled_at', { withTimezone: true }),
  anonymizationRequestedAt: timestamp('anonymization_requested_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const organizations = pgTable('organizations', {
  id: id(),
  displayName: varchar('display_name', { length: 180 }).notNull(),
  legalName: varchar('legal_name', { length: 240 }),
  nationalId: varchar('national_id', { length: 11 }),
  type: organizationType('type').notNull(),
  billingAddress: text('billing_address'),
  postalCode: varchar('postal_code', { length: 10 }),
  isPlaceholder: boolean('is_placeholder').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => [uniqueIndex('organizations_national_id_unique').on(table.nationalId)]);

export const memberships = pgTable('memberships', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  representationConfirmedAt: timestamp('representation_confirmed_at', { withTimezone: true }),
  active: boolean('active').notNull().default(true),
  createdAt: createdAt()
}, (table) => [uniqueIndex('memberships_user_org_unique').on(table.userId, table.organizationId)]);

export const sessions = pgTable('sessions', {
  id: id(),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  authLevel: integer('auth_level').notNull().default(1),
  createdAt: createdAt()
}, (table) => [index('sessions_user_idx').on(table.userId, table.expiresAt)]);

export const otpChallenges = pgTable('otp_challenges', {
  id: id(),
  mobile: varchar('mobile', { length: 16 }).notNull(),
  codeHash: varchar('code_hash', { length: 128 }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  ipHash: varchar('ip_hash', { length: 128 }).notNull(),
  createdAt: createdAt()
}, (table) => [index('otp_mobile_created_idx').on(table.mobile, table.createdAt)]);

export const mfaFactors = pgTable('mfa_factors', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id),
  secretEncrypted: text('secret_encrypted').notNull(),
  recoveryCodeHashes: jsonb('recovery_code_hashes').notNull().$type<string[]>(),
  createdAt: createdAt(),
  revokedAt: timestamp('revoked_at', { withTimezone: true })
});

export const requests = pgTable('requests', {
  id: id(),
  reference: varchar('reference', { length: 32 }).notNull().unique(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 180 }).notNull(),
  description: text('description').notNull(),
  source: varchar('source', { length: 80 }).notNull(),
  state: requestState('state').notNull().default('SUBMITTED'),
  version: integer('version').notNull().default(0),
  idempotencyKey: uuid('idempotency_key').notNull(),
  privacyVersion: varchar('privacy_version', { length: 40 }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => [
  uniqueIndex('requests_owner_idempotency_unique').on(table.createdByUserId, table.idempotencyKey),
  index('requests_search_idx').on(table.reference, table.organizationId, table.state, table.submittedAt)
]);

export const attachments = pgTable('attachments', {
  id: id(),
  requestId: uuid('request_id').references(() => requests.id),
  bankTransferId: uuid('bank_transfer_id'),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storageName: varchar('storage_name', { length: 255 }).notNull().unique(),
  detectedMime: varchar('detected_mime', { length: 160 }),
  sizeBytes: integer('size_bytes').notNull(),
  status: varchar('status', { length: 24 }).notNull().default('QUARANTINED'),
  scanDetails: varchar('scan_details', { length: 500 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: createdAt()
});

export const screenings = pgTable('screenings', {
  id: id(),
  requestId: uuid('request_id').notNull().references(() => requests.id),
  actorId: uuid('actor_id').notNull().references(() => users.id),
  outcome: varchar('outcome', { length: 32 }).notNull(),
  note: text('note').notNull(),
  contactedAt: timestamp('contacted_at', { withTimezone: true }),
  createdAt: createdAt()
});

export const requestAssignments = pgTable('request_assignments', {
  id: id(),
  requestId: uuid('request_id').notNull().references(() => requests.id),
  assigneeId: uuid('assignee_id').notNull().references(() => users.id),
  assignedById: uuid('assigned_by_id').notNull().references(() => users.id),
  createdAt: createdAt(),
  revokedAt: timestamp('revoked_at', { withTimezone: true })
});

export const offers = pgTable('offers', {
  id: id(),
  requestId: uuid('request_id').notNull().references(() => requests.id),
  currentVersion: integer('current_version').notNull().default(1),
  state: offerState('state').notNull().default('DRAFT'),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  viewedAt: timestamp('viewed_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => [index('offers_request_idx').on(table.requestId, table.state)]);

export const offerVersions = pgTable('offer_versions', {
  id: id(),
  offerId: uuid('offer_id').notNull().references(() => offers.id),
  version: integer('version').notNull(),
  title: varchar('title', { length: 180 }).notNull(),
  description: text('description').notNull(),
  scope: text('scope').notNull(),
  deliverable: text('deliverable').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  timing: varchar('timing', { length: 500 }).notNull(),
  expertMix: text('expert_mix').notNull(),
  baseAmountIrr: bigint('base_amount_irr', { mode: 'number' }).notNull(),
  taxRateBps: integer('tax_rate_bps').notNull(),
  taxAmountIrr: bigint('tax_amount_irr', { mode: 'number' }).notNull(),
  totalAmountIrr: bigint('total_amount_irr', { mode: 'number' }).notNull(),
  termsVersion: varchar('terms_version', { length: 40 }).notNull(),
  cancellationVersion: varchar('cancellation_version', { length: 40 }).notNull(),
  feeDeductionTerms: text('fee_deduction_terms').notNull(),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: createdAt()
}, (table) => [uniqueIndex('offer_versions_unique').on(table.offerId, table.version)]);

export const orders = pgTable('orders', {
  id: id(),
  reference: varchar('reference', { length: 32 }).notNull().unique(),
  offerId: uuid('offer_id').notNull().references(() => offers.id),
  offerVersion: integer('offer_version').notNull(),
  type: varchar('type', { length: 40 }).notNull().default('INITIAL_ASSESSMENT'),
  state: orderState('state').notNull().default('DRAFT'),
  totalAmountIrr: bigint('total_amount_irr', { mode: 'number' }).notNull(),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => [uniqueIndex('orders_active_offer_unique').on(table.offerId)]);

export const payments = pgTable('payments', {
  id: id(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  provider: varchar('provider', { length: 40 }).notNull(),
  providerReference: varchar('provider_reference', { length: 160 }),
  amountIrr: bigint('amount_irr', { mode: 'number' }).notNull(),
  state: paymentState('state').notNull().default('INITIATED'),
  idempotencyKey: uuid('idempotency_key').notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => [uniqueIndex('payments_order_idempotency_unique').on(table.orderId, table.idempotencyKey), uniqueIndex('payments_provider_reference_unique').on(table.provider, table.providerReference)]);

export const bankTransfers = pgTable('bank_transfers', {
  id: id(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  reference: varchar('reference', { length: 100 }).notNull(),
  transferredAt: timestamp('transferred_at', { withTimezone: true }).notNull(),
  amountIrr: bigint('amount_irr', { mode: 'number' }).notNull(),
  bankName: varchar('bank_name', { length: 100 }).notNull(),
  depositorName: varchar('depositor_name', { length: 160 }).notNull(),
  state: bankTransferState('state').notNull().default('SUBMITTED'),
  reviewedById: uuid('reviewed_by_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNote: text('review_note'),
  idempotencyKey: uuid('idempotency_key').notNull(),
  createdAt: createdAt()
}, (table) => [uniqueIndex('bank_transfers_order_idempotency_unique').on(table.orderId, table.idempotencyKey)]);

export const refundRecords = pgTable('refund_records', {
  id: id(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  amountIrr: bigint('amount_irr', { mode: 'number' }).notNull(),
  reason: text('reason').notNull(),
  reference: varchar('reference', { length: 100 }).notNull(),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: createdAt()
});

export const contractInvoices = pgTable('contract_invoices', {
  id: id(),
  reference: varchar('reference', { length: 32 }).notNull().unique(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  title: varchar('title', { length: 180 }).notNull(),
  description: text('description').notNull(),
  totalAmountIrr: bigint('total_amount_irr', { mode: 'number' }).notNull(),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  state: varchar('state', { length: 24 }).notNull().default('SENT'),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const notificationTemplates = pgTable('notification_templates', {
  id: id(),
  event: varchar('event', { length: 80 }).notNull(),
  channel: notificationChannel('channel').notNull(),
  version: integer('version').notNull(),
  body: text('body').notNull(),
  active: boolean('active').notNull().default(true),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: createdAt()
}, (table) => [uniqueIndex('notification_template_version_unique').on(table.event, table.channel, table.version)]);

export const serviceSettings = pgTable('service_settings', {
  key: varchar('key', { length: 80 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedById: uuid('updated_by_id').references(() => users.id),
  updatedAt: updatedAt()
});

export const notifications = pgTable('notifications', {
  id: id(),
  event: varchar('event', { length: 80 }).notNull(),
  channel: notificationChannel('channel').notNull(),
  destination: varchar('destination', { length: 254 }).notNull(),
  body: text('body').notNull(),
  providerReference: varchar('provider_reference', { length: 160 }),
  status: varchar('status', { length: 32 }).notNull().default('PENDING'),
  attempts: integer('attempts').notNull().default(0),
  lastError: varchar('last_error', { length: 500 }),
  relatedEntity: varchar('related_entity', { length: 64 }),
  relatedId: uuid('related_id'),
  createdAt: createdAt(),
  sentAt: timestamp('sent_at', { withTimezone: true })
});

export const outboxJobs = pgTable('outbox_jobs', {
  id: id(),
  type: varchar('type', { length: 80 }).notNull(),
  payload: jsonb('payload').notNull(),
  attempts: integer('attempts').notNull().default(0),
  runAfter: timestamp('run_after', { withTimezone: true }).defaultNow().notNull(),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  deadLetterAt: timestamp('dead_letter_at', { withTimezone: true }),
  createdAt: createdAt()
});

export const contentEntries = pgTable('content_entries', {
  id: id(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  title: varchar('title', { length: 240 }).notNull(),
  body: jsonb('body').notNull(),
  state: publicationState('state').notNull().default('DRAFT'),
  isPlaceholder: boolean('is_placeholder').notNull().default(false),
  version: integer('version').notNull().default(1),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdById: uuid('created_by_id').references(() => users.id),
  updatedAt: updatedAt(),
  createdAt: createdAt()
});

export const contentRevisions = pgTable('content_revisions', {
  id: id(),
  contentEntryId: uuid('content_entry_id').notNull().references(() => contentEntries.id),
  version: integer('version').notNull(),
  title: varchar('title', { length: 240 }).notNull(),
  body: jsonb('body').notNull(),
  state: publicationState('state').notNull(),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: createdAt()
}, (table) => [uniqueIndex('content_revision_unique').on(table.contentEntryId, table.version)]);

export const clients = pgTable('clients', {
  id: id(),
  name: varchar('name', { length: 240 }).notNull(),
  logoAlt: varchar('logo_alt', { length: 240 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  displayOrder: integer('display_order').notNull().default(0),
  approvedForPublication: boolean('approved_for_publication').notNull().default(false),
  isSynthetic: boolean('is_synthetic').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const caseStudies = pgTable('case_studies', {
  id: id(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  clientId: uuid('client_id').references(() => clients.id),
  title: varchar('title', { length: 240 }).notNull(),
  problem: text('problem').notNull(),
  action: text('action').notNull(),
  result: text('result').notNull(),
  state: publicationState('state').notNull().default('DRAFT'),
  approvedForPublication: boolean('approved_for_publication').notNull().default(false),
  isSynthetic: boolean('is_synthetic').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const teamMembers = pgTable('team_members', {
  id: id(),
  name: varchar('name', { length: 160 }).notNull(),
  role: varchar('role', { length: 160 }).notNull(),
  expertise: text('expertise').notNull(),
  biography: text('biography').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  state: publicationState('state').notNull().default('DRAFT'),
  approvedForPublication: boolean('approved_for_publication').notNull().default(false),
  isSynthetic: boolean('is_synthetic').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const legalDocuments = pgTable('legal_documents', {
  id: id(),
  kind: varchar('kind', { length: 64 }).notNull(),
  version: varchar('version', { length: 40 }).notNull(),
  body: text('body').notNull(),
  effectiveAt: timestamp('effective_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedById: uuid('approved_by_id').references(() => users.id),
  isDraft: boolean('is_draft').notNull().default(true),
  createdAt: createdAt()
}, (table) => [uniqueIndex('legal_document_version_unique').on(table.kind, table.version)]);

export const consentLogs = pgTable('consent_logs', {
  id: id(),
  userId: uuid('user_id').references(() => users.id),
  offerId: uuid('offer_id').references(() => offers.id),
  orderId: uuid('order_id').references(() => orders.id),
  documentKind: varchar('document_kind', { length: 64 }).notNull(),
  documentVersion: varchar('document_version', { length: 40 }).notNull(),
  ipHash: varchar('ip_hash', { length: 128 }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }).defaultNow().notNull()
});

export const complaints = pgTable('complaints', {
  id: id(),
  reference: varchar('reference', { length: 32 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id),
  name: varchar('name', { length: 160 }).notNull(),
  mobile: varchar('mobile', { length: 16 }).notNull(),
  email: varchar('email', { length: 254 }),
  subject: varchar('subject', { length: 180 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 32 }).notNull().default('SUBMITTED'),
  idempotencyKey: uuid('idempotency_key').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => [uniqueIndex('complaints_mobile_idempotency_unique').on(table.mobile, table.idempotencyKey)]);

export const auditLogs = pgTable('audit_logs', {
  id: id(),
  actorId: uuid('actor_id').references(() => users.id),
  actorRole: varchar('actor_role', { length: 32 }),
  action: varchar('action', { length: 100 }).notNull(),
  entity: varchar('entity', { length: 64 }).notNull(),
  entityId: uuid('entity_id'),
  before: jsonb('before'),
  after: jsonb('after'),
  reason: text('reason'),
  correlationId: uuid('correlation_id'),
  ipHash: varchar('ip_hash', { length: 128 }),
  createdAt: createdAt()
}, (table) => [index('audit_entity_idx').on(table.entity, table.entityId, table.createdAt)]);

export const errorEvents = pgTable('error_events', {
  id: id(),
  level: varchar('level', { length: 16 }).notNull(),
  message: text('message').notNull(),
  correlationId: uuid('correlation_id'),
  route: varchar('route', { length: 240 }),
  createdAt: createdAt()
});

export const productEvents = pgTable('product_events', {
  id: id(),
  name: varchar('name', { length: 80 }).notNull(),
  subjectHash: varchar('subject_hash', { length: 128 }),
  properties: jsonb('properties').notNull(),
  createdAt: createdAt()
});

export const appSettings = pgTable('app_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedById: uuid('updated_by_id').references(() => users.id),
  updatedAt: updatedAt()
});

export const userRelations = relations(users, ({ many }) => ({ memberships: many(memberships), sessions: many(sessions) }));
export const organizationRelations = relations(organizations, ({ many }) => ({ memberships: many(memberships), requests: many(requests) }));
export const requestRelations = relations(requests, ({ one, many }) => ({ organization: one(organizations, { fields: [requests.organizationId], references: [organizations.id] }), attachments: many(attachments), offers: many(offers) }));
