-- WaitFree Chunk 3 추가 마이그레이션
-- Supabase SQL Editor에서 실행
-- 기관 등록 시 fingerprint 기반 24시간 제한을 위한 컬럼 추가

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS created_by_fingerprint text;

-- 인덱스 추가 (fingerprint + 생성일 기준 조회용)
CREATE INDEX IF NOT EXISTS idx_organizations_fingerprint_created
ON organizations(created_by_fingerprint, created_at DESC)
WHERE created_by_fingerprint IS NOT NULL;
