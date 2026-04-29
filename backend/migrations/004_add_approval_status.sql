CREATE TYPE approval_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE users ADD COLUMN approval_status approval_status_enum NOT NULL DEFAULT 'APPROVED';
