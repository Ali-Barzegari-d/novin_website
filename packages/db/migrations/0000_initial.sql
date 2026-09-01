CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE organization_type AS ENUM ('PRIVATE','PUBLIC','GOVERNMENT');
CREATE TYPE staff_role AS ENUM ('CUSTOMER','EXPERT','OPERATIONS','FINANCE','CONTENT','SUPERADMIN');
CREATE TYPE request_state AS ENUM ('SUBMITTED','UNDER_REVIEW','CONTACT_PENDING','NEED_MORE_INFO','QUALIFIED','REJECTED','OFFER_SENT','PAID','SESSION_SCHEDULED','SESSION_COMPLETED','PROJECT_PROPOSED','ARCHIVED');
CREATE TYPE offer_state AS ENUM ('DRAFT','SENT','VIEWED','ACCEPTED','EXPIRED','REVOKED');
CREATE TYPE order_state AS ENUM ('DRAFT','PAYMENT_PENDING','PAID','CANCELLED','REFUNDED');
CREATE TYPE payment_state AS ENUM ('INITIATED','REDIRECTED','VERIFIED','FAILED','REVERSED');
CREATE TYPE bank_transfer_state AS ENUM ('SUBMITTED','REVIEW_PENDING','CONFIRMED','REJECTED');
CREATE TYPE notification_channel AS ENUM ('SMS','EMAIL');
CREATE TYPE publication_state AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), mobile varchar(16) NOT NULL UNIQUE,
  first_name varchar(80), last_name varchar(80), email varchar(254), email_verified_at timestamptz,
  job_title varchar(120), role staff_role NOT NULL DEFAULT 'CUSTOMER', active boolean NOT NULL DEFAULT true,
  mfa_enrolled_at timestamptz, anonymization_requested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), display_name varchar(180) NOT NULL,
  legal_name varchar(240), national_id varchar(11) UNIQUE, type organization_type NOT NULL,
  billing_address text, postal_code varchar(10), is_placeholder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (national_id IS NULL OR national_id ~ '^[0-9]{11}$')
);
CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
  organization_id uuid NOT NULL REFERENCES organizations(id), representation_confirmed_at timestamptz,
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), token_hash varchar(128) NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL, revoked_at timestamptz,
  auth_level integer NOT NULL DEFAULT 1 CHECK (auth_level BETWEEN 1 AND 3), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON sessions (user_id, expires_at);
CREATE TABLE otp_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), mobile varchar(16) NOT NULL, code_hash varchar(128) NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5), expires_at timestamptz NOT NULL,
  consumed_at timestamptz, ip_hash varchar(128) NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX otp_mobile_created_idx ON otp_challenges (mobile, created_at);
CREATE TABLE mfa_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
  secret_encrypted text NOT NULL, recovery_code_hashes jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz
);
CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference varchar(32) NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES organizations(id), created_by_user_id uuid NOT NULL REFERENCES users(id),
  title varchar(180) NOT NULL, description text NOT NULL, source varchar(80) NOT NULL,
  state request_state NOT NULL DEFAULT 'SUBMITTED', version integer NOT NULL DEFAULT 0,
  idempotency_key uuid NOT NULL, privacy_version varchar(40) NOT NULL, submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (created_by_user_id, idempotency_key)
);
CREATE INDEX requests_search_idx ON requests (reference, organization_id, state, submitted_at);
CREATE TABLE screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL REFERENCES requests(id),
  actor_id uuid NOT NULL REFERENCES users(id), outcome varchar(32) NOT NULL CHECK (outcome IN ('QUALIFIED','REJECTED','NEED_MORE_INFO')),
  note text NOT NULL, contacted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE request_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL REFERENCES requests(id),
  assignee_id uuid NOT NULL REFERENCES users(id), assigned_by_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz
);
CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL REFERENCES requests(id),
  current_version integer NOT NULL DEFAULT 1 CHECK (current_version > 0), state offer_state NOT NULL DEFAULT 'DRAFT',
  token_hash varchar(128) NOT NULL UNIQUE, valid_until timestamptz NOT NULL, viewed_at timestamptz, revoked_at timestamptz,
  created_by_id uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX offers_request_idx ON offers (request_id, state);
CREATE TABLE offer_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), offer_id uuid NOT NULL REFERENCES offers(id), version integer NOT NULL,
  title varchar(180) NOT NULL, description text NOT NULL, scope text NOT NULL, deliverable text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes BETWEEN 30 AND 960), timing varchar(500) NOT NULL, expert_mix text NOT NULL,
  base_amount_irr bigint NOT NULL CHECK (base_amount_irr > 0), tax_rate_bps integer NOT NULL CHECK (tax_rate_bps BETWEEN 0 AND 100000),
  tax_amount_irr bigint NOT NULL CHECK (tax_amount_irr >= 0), total_amount_irr bigint NOT NULL CHECK (total_amount_irr = base_amount_irr + tax_amount_irr),
  terms_version varchar(40) NOT NULL, cancellation_version varchar(40) NOT NULL, fee_deduction_terms text NOT NULL,
  created_by_id uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (offer_id, version)
);
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference varchar(32) NOT NULL UNIQUE, offer_id uuid NOT NULL UNIQUE REFERENCES offers(id),
  offer_version integer NOT NULL, type varchar(40) NOT NULL DEFAULT 'INITIAL_ASSESSMENT', state order_state NOT NULL DEFAULT 'DRAFT',
  total_amount_irr bigint NOT NULL CHECK (total_amount_irr > 0), collected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id), provider varchar(40) NOT NULL,
  provider_reference varchar(160), amount_irr bigint NOT NULL CHECK (amount_irr > 0), state payment_state NOT NULL DEFAULT 'INITIATED',
  idempotency_key uuid NOT NULL, verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, idempotency_key), UNIQUE (provider, provider_reference)
);
CREATE TABLE bank_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id), reference varchar(100) NOT NULL,
  transferred_at timestamptz NOT NULL, amount_irr bigint NOT NULL CHECK (amount_irr > 0), bank_name varchar(100) NOT NULL,
  depositor_name varchar(160) NOT NULL, state bank_transfer_state NOT NULL DEFAULT 'SUBMITTED',
  reviewed_by_id uuid REFERENCES users(id), reviewed_at timestamptz, review_note text, idempotency_key uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (order_id, idempotency_key)
);
CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid REFERENCES requests(id), bank_transfer_id uuid REFERENCES bank_transfers(id),
  original_name varchar(255) NOT NULL, storage_name varchar(255) NOT NULL UNIQUE, detected_mime varchar(160),
  size_bytes integer NOT NULL CHECK (size_bytes BETWEEN 1 AND 52428800), status varchar(24) NOT NULL DEFAULT 'QUARANTINED',
  scan_details varchar(500), expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((request_id IS NOT NULL)::integer + (bank_transfer_id IS NOT NULL)::integer = 1)
);
CREATE TABLE refund_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id), amount_irr bigint NOT NULL CHECK (amount_irr > 0),
  reason text NOT NULL, reference varchar(100) NOT NULL, created_by_id uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event varchar(80) NOT NULL, channel notification_channel NOT NULL,
  version integer NOT NULL, body text NOT NULL, active boolean NOT NULL DEFAULT true, created_by_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (event, channel, version)
);
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event varchar(80) NOT NULL, channel notification_channel NOT NULL,
  destination varchar(254) NOT NULL, body text NOT NULL, provider_reference varchar(160), status varchar(32) NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5), last_error varchar(500), related_entity varchar(64), related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
);
CREATE TABLE outbox_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), type varchar(80) NOT NULL, payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5), run_after timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz, completed_at timestamptz, dead_letter_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE content_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug varchar(120) NOT NULL UNIQUE, title varchar(240) NOT NULL, body jsonb NOT NULL,
  state publication_state NOT NULL DEFAULT 'DRAFT', is_placeholder boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1,
  published_at timestamptz, created_by_id uuid REFERENCES users(id), updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), content_entry_id uuid NOT NULL REFERENCES content_entries(id), version integer NOT NULL,
  title varchar(240) NOT NULL, body jsonb NOT NULL, state publication_state NOT NULL, created_by_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (content_entry_id, version)
);
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(240) NOT NULL, logo_alt varchar(240) NOT NULL, logo_url varchar(500),
  display_order integer NOT NULL DEFAULT 0, approved_for_publication boolean NOT NULL DEFAULT false, is_synthetic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug varchar(120) NOT NULL UNIQUE, client_id uuid REFERENCES clients(id), title varchar(240) NOT NULL,
  problem text NOT NULL, action text NOT NULL, result text NOT NULL, state publication_state NOT NULL DEFAULT 'DRAFT',
  approved_for_publication boolean NOT NULL DEFAULT false, is_synthetic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(160) NOT NULL, role varchar(160) NOT NULL, expertise text NOT NULL,
  biography text NOT NULL, image_url varchar(500), state publication_state NOT NULL DEFAULT 'DRAFT',
  approved_for_publication boolean NOT NULL DEFAULT false, is_synthetic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind varchar(64) NOT NULL, version varchar(40) NOT NULL, body text NOT NULL,
  effective_at timestamptz, approved_at timestamptz, approved_by_id uuid REFERENCES users(id), is_draft boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (kind, version)
);
CREATE TABLE consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), offer_id uuid REFERENCES offers(id), order_id uuid REFERENCES orders(id),
  document_kind varchar(64) NOT NULL, document_version varchar(40) NOT NULL, ip_hash varchar(128) NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference varchar(32) NOT NULL UNIQUE, user_id uuid REFERENCES users(id),
  name varchar(160) NOT NULL, mobile varchar(16) NOT NULL, email varchar(254), subject varchar(180) NOT NULL, description text NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'SUBMITTED', idempotency_key uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mobile, idempotency_key)
);
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES users(id), actor_role varchar(32), action varchar(100) NOT NULL,
  entity varchar(64) NOT NULL, entity_id uuid, before jsonb, after jsonb, reason text, correlation_id uuid, ip_hash varchar(128),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_entity_idx ON audit_logs (entity, entity_id, created_at);
CREATE TABLE error_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), level varchar(16) NOT NULL, message text NOT NULL, correlation_id uuid, route varchar(240), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE product_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(80) NOT NULL, subject_hash varchar(128), properties jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE app_settings (key varchar(100) PRIMARY KEY, value jsonb NOT NULL, updated_by_id uuid REFERENCES users(id), updated_at timestamptz NOT NULL DEFAULT now());

CREATE OR REPLACE FUNCTION prevent_immutable_ledger_changes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'immutable ledger record'; END; $$;
CREATE TRIGGER consent_logs_immutable BEFORE UPDATE OR DELETE ON consent_logs FOR EACH ROW EXECUTE FUNCTION prevent_immutable_ledger_changes();
CREATE TRIGGER audit_logs_immutable BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_immutable_ledger_changes();
