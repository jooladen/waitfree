-- WaitFree DB 마이그레이션
-- Supabase SQL Editor에서 실행

-- =====================
-- organizations 테이블
-- =====================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('website', 'phone')),
  url text,
  phone text,
  is_preset boolean NOT NULL DEFAULT false,
  ping_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_org_type_value CHECK (
    (type = 'website' AND url IS NOT NULL) OR
    (type = 'phone' AND phone IS NOT NULL)
  )
);

-- organizations 인덱스
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_is_preset ON organizations(is_preset) WHERE is_preset = true;
CREATE UNIQUE INDEX unique_url ON organizations(url) WHERE url IS NOT NULL;
CREATE UNIQUE INDEX unique_phone ON organizations(phone) WHERE phone IS NOT NULL;

-- =====================
-- reports 테이블
-- =====================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('good', 'bad')),
  wait_count integer CHECK (wait_count >= 0 AND wait_count <= 999),
  fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- reports 인덱스
CREATE INDEX idx_reports_org_created ON reports(org_id, created_at DESC);
CREATE INDEX idx_reports_fingerprint_created ON reports(fingerprint, created_at DESC);
CREATE INDEX idx_reports_created ON reports(created_at);

-- =====================
-- ping_results 테이블
-- =====================
CREATE TABLE IF NOT EXISTS ping_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  response_time_ms integer NOT NULL,
  status_code integer,
  is_error boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ping_results 인덱스
CREATE INDEX idx_ping_org_created ON ping_results(org_id, created_at DESC);
CREATE INDEX idx_ping_created ON ping_results(created_at);

-- =====================
-- Realtime 활성화
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- =====================
-- Seed 데이터
-- =====================
INSERT INTO organizations (name, type, url, is_preset, ping_enabled)
VALUES ('정부24', 'website', 'www.gov.kr', true, true);

INSERT INTO organizations (name, type, phone, is_preset, ping_enabled)
VALUES ('국민건강보험공단', 'phone', '15771000', true, true);
