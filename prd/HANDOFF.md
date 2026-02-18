# WaitFree — HANDOFF (작업 인수인계)

## 마지막 완료
Chunk 5

## 현재 상태
기관 등록 페이지(/add) + Supabase Realtime 실시간 반영 완성. 빌드 정상 통과.

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
- FingerprintProvider + ToastProvider가 layout.tsx에서 앱 전체를 감싸고 있음
- StatusCard는 클라이언트 컴포넌트로 /api/status/[orgId]를 직접 fetch
- OrgList의 각 아이템은 축소 상태에서도 signal을 가져와 소형 신호등으로 표시
- 라이트 모드만 지원 (PRD 기준), 다크 모드 CSS 제거됨
- globals.css에서 커스텀 toast-in 애니메이션 정의
- Realtime: useRealtimeReports 훅이 reports INSERT 구독, refreshStatus(silent)로 데이터 갱신
- Realtime: useConnectionStatus 훅이 채널 상태 모니터링, 끊김 시 배너 표시, 재연결 시 자동 동기화
- StatusCard에 refreshStatus 함수 추가 (loading 표시 없이 백그라운드 갱신)
- /add 페이지: 클라이언트 검증 + POST /api/organization 호출 + 성공 시 메인으로 이동

## 다음 작업
Chunk 6 시작 (SEO + 에러 UI + 전체 점검)

## 히스토리
| 시점 | 내용 |
|------|------|
| 프로젝트 생성 | HANDOFF 초기화 |
| Chunk 1 완료 | 프로젝트 초기 세팅 (패키지 설치, Supabase 클라이언트, migration.sql, 상수/타입, 폴더 구조) |
| Chunk 2 완료 | 핑거프린트 유틸(fingerprint.ts), ping 함수(ping.ts), 신호등 판정(signal.ts), status API, admin 클라이언트 |
| Chunk 3 완료 | 제보 API(report), 기관 등록 API(organization), 추가 마이그레이션(migration_chunk3.sql) |
| Chunk 4 완료 | 메인 페이지 UI(layout, page), 상태 카드(StatusCard), 신호등(TrafficLight), Preset 탭(PresetTabs), 기관 리스트(OrgList), 핑거프린트 Provider, Toast, Skeleton, ErrorState |
| Chunk 5 완료 | 기관 등록 페이지(add/page.tsx), Realtime 훅(useRealtimeReports, useConnectionStatus), StatusCard Realtime 통합 |
