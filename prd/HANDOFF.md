# WaitFree — HANDOFF (작업 인수인계)

## 마지막 완료
Chunk 2

## 현재 상태
핑거프린트 유틸, On-demand ping, 신호등 판정 로직, GET /api/status/[orgId] API 완성. 빌드 정상 통과.

## 주의사항
- Chunk 0은 사람이 직접 (Supabase, Vercel, GitHub 계정 + 저장소)
- Chunk 1 후 사람이 직접: .env.local 키 입력 + migration.sql 실행
- admin.ts는 SUPABASE_SERVICE_ROLE_KEY를 사용하므로 .env.local에 반드시 입력 필요
- status API에서 after()를 사용하여 백그라운드 ping 실행 (Next.js 15+ 기능)
- ping 대상 URL에 프로토콜이 없으면 자동으로 https:// 추가

## 다음 작업
Chunk 3 시작 (제보 API + 기관 등록 API)

## 히스토리
| 시점 | 내용 |
|------|------|
| 프로젝트 생성 | HANDOFF 초기화 |
| Chunk 1 완료 | 프로젝트 초기 세팅 (패키지 설치, Supabase 클라이언트, migration.sql, 상수/타입, 폴더 구조) |
| Chunk 2 완료 | 핑거프린트 유틸(fingerprint.ts), ping 함수(ping.ts), 신호등 판정(signal.ts), status API, admin 클라이언트 |
