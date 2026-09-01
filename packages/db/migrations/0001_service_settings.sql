CREATE TABLE service_settings (
  key varchar(80) PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by_id uuid REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contract_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference varchar(32) NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  title varchar(180) NOT NULL,
  description text NOT NULL,
  total_amount_irr bigint NOT NULL,
  token_hash varchar(128) NOT NULL UNIQUE,
  valid_until timestamptz NOT NULL,
  state varchar(24) NOT NULL DEFAULT 'SENT',
  created_by_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
