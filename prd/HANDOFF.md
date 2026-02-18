# WaitFree — HANDOFF (작업 인수인계)

## 마지막 완료
Chunk 3

## 현재 상태
제보 API(POST /api/report)와 기관 등록 API(POST /api/organization) 완성. 빌드 정상 통과.

## 주의사항
- Chunk 0은 사람이 직접 (Supabase, Vercel, GitHub 계정 + 저장소)
- Chunk 1 후 사람이 직접: .env.local 키 입력 + migration.sql 실행
- admin.ts는 SUPABASE_SERVICE_ROLE_KEY를 사용하므로 .env.local에 반드시 입력 필요
- status API에서 after()를 사용하여 백그라운드 ping 실행 (Next.js 15+ 기능)
- ping 대상 URL에 프로토콜이 없으면 자동으로 https:// 추가
- **Chunk 3 후 사람이 직접: prd/migration_chunk3.sql을 Supabase SQL Editor에서 실행 필요** (organizations 테이블에 created_by_fingerprint 컬럼 추가)
- 기관 등록 시 URL 정규화: 프로토콜 제거 + trailing slash 제거 + 소문자화
- 기관 등록 시 전화번호 정규화: 하이픈 제거
- 제보 API에서 서버 측 fingerprint = combineFingerprint(browserFp, clientIP)로 생성
- 기관 등록 API에서 동일한 fingerprint 방식으로 24시간 내 3개 제한 적용

## 다음 작업
Chunk 4 시작 (메인 페이지 UI + 상태 카드)

## 히스토리
| 시점 | 내용 |
|------|------|
| 프로젝트 생성 | HANDOFF 초기화 |
| Chunk 1 완료 | 프로젝트 초기 세팅 (패키지 설치, Supabase 클라이언트, migration.sql, 상수/타입, 폴더 구조) |
| Chunk 2 완료 | 핑거프린트 유틸(fingerprint.ts), ping 함수(ping.ts), 신호등 판정(signal.ts), status API, admin 클라이언트 |
| Chunk 3 완료 | 제보 API(report), 기관 등록 API(organization), 추가 마이그레이션(migration_chunk3.sql) |
