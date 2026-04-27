CREATE TYPE record_type AS ENUM ('INCOME', 'EXPENSE');

CREATE TABLE financial_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount        NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  type          record_type NOT NULL,
  category      VARCHAR(100) NOT NULL,
  date          DATE NOT NULL,
  description   TEXT,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_records_type        ON financial_records(type)         WHERE is_deleted = FALSE;
CREATE INDEX idx_records_category    ON financial_records(category)     WHERE is_deleted = FALSE;
CREATE INDEX idx_records_date        ON financial_records(date)         WHERE is_deleted = FALSE;
CREATE INDEX idx_records_created_by  ON financial_records(created_by_id);
CREATE INDEX idx_records_is_deleted  ON financial_records(is_deleted);
