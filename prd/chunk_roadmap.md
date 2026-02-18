# WaitFree — Chunk 개발 로드맵

---

## Chunk 0: 사람이 직접 할 것 (Claude Code 아님)

- [ ] Supabase 계정 생성 + 새 프로젝트 생성
  - 프로젝트 이름: waitfree
  - Region: Northeast Asia (ap-northeast-1) 또는 가까운 곳
  - Project URL, anon key, service_role key 메모해두기
- [ ] Vercel 계정 생성 (GitHub 연동)
- [ ] GitHub 저장소 생성 (빈 저장소, README 없이)
  - 저장소 이름: waitfree
- [ ] CLAUDE.md에 GitHub 저장소 URL 채워넣기
  - `여기에_GitHub_저장소_URL_입력` → 실제 URL로 교체
- [ ] 프로젝트 폴더에 문서 파일 배치
  - 루트에 CLAUDE.md
  - prd/ 폴더에 PRD.md, chunk_roadmap.md, HANDOFF.md

---

## Chunk 1: 프로젝트 초기 세팅

**목표:** Next.js 프로젝트 생성 + Supabase 연결 + DB 마이그레이션 파일 준비

**선행조건:** Chunk 0 완료 (GitHub 저장소, Supabase 프로젝트 존재)

**상세 작업:**
- [x] Next.js 16 프로젝트 생성 (App Router, TypeScript, Tailwind CSS, ESLint)
  - package.json 이미 있으면 프로젝트 생성 스킵, 없는 패키지만 추가
- [x] 필요 패키지 설치
  - @supabase/supabase-js
  - @supabase/ssr
  - @fingerprintjs/fingerprintjs
- [x] .env.local 생성 (빈칸)
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- [x] Supabase 클라이언트 유틸 파일 생성
  - src/lib/supabase/client.ts (브라우저용)
  - src/lib/supabase/server.ts (서버용)
- [x] DB 마이그레이션 SQL 파일 작성 → prd/migration.sql
  - organizations 테이블 + 인덱스 + CHECK 제약
  - reports 테이블 + 인덱스
  - ping_results 테이블 + 인덱스
  - Realtime 활성화: ALTER PUBLICATION supabase_realtime ADD TABLE reports;
  - Seed 데이터 INSERT 포함:
    - 정부24 (website, https://www.gov.kr, is_preset=true)
    - 국민건강보험공단 (phone, 15771000, is_preset=true)
- [x] 상수 파일 생성: src/lib/constants.ts
  - PING_INTERVAL_MS = 300000 (5분)
  - REPORT_COOLDOWN_MS = 300000 (5분)
  - REPORT_WINDOW_MS = 600000 (10분)
  - ORG_REGISTER_DAILY_LIMIT = 3
  - PING_TIMEOUT_MS = 10000 (10초)
  - PING_FAST_MS = 1000
  - PING_SLOW_MS = 5000
  - CONSECUTIVE_FAIL_THRESHOLD = 2
  - CONSECUTIVE_BLOCK_THRESHOLD = 5
  - TIMELINE_LIMIT = 5
  - MAX_WAIT_COUNT = 999
  - ORG_NAME_MIN = 2
  - ORG_NAME_MAX = 50
- [x] TypeScript 타입 정의: src/types/index.ts
  - Organization, Report, PingResult, SignalColor, OrgType 등
- [x] 프로젝트 폴더 구조 세팅
  ```
  src/
    app/
      layout.tsx
      page.tsx
      add/page.tsx
      api/
        report/route.ts        (빈 파일)
        status/[orgId]/route.ts (빈 파일)
        organization/route.ts   (빈 파일)
    lib/
      supabase/
        client.ts
        server.ts
      constants.ts
      fingerprint.ts (빈 파일)
    types/
      index.ts
    components/ (빈 폴더)
  ```
- [x] .gitignore에 .env.local 포함 확인
- [x] git init + 첫 커밋 + push

**완료조건:**
- [x] npm run dev 실행 시 에러 없이 기본 페이지 표시
- [x] .env.local 파일 존재 (빈칸 상태)
- [x] prd/migration.sql 파일 존재
- [x] 상수 파일, 타입 파일 존재
- [x] GitHub에 push 완료

---

## Chunk 1 끝난 후: 사람이 직접 할 것

- [ ] .env.local에 Supabase 키 3개 채워넣기
  - NEXT_PUBLIC_SUPABASE_URL → Supabase 대시보드 > Settings > API > Project URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY → Supabase 대시보드 > Settings > API > anon public
  - SUPABASE_SERVICE_ROLE_KEY → Supabase 대시보드 > Settings > API > service_role
- [ ] prd/migration.sql을 Supabase SQL Editor에서 실행
  - Supabase 대시보드 > SQL Editor > New Query > migration.sql 내용 붙여넣기 > Run
- [ ] 실행 후 Table Editor에서 organizations 테이블에 정부24, 국민건강보험공단 2개 있는지 확인

---

## Chunk 2: 핑거프린트 + 기관 상태 API

**목표:** 사용자 식별(핑거프린트) 구현 + 기관 상태 조회 API 완성

**선행조건:** Chunk 1 완료 + .env 키 입력 + DB 마이그레이션 실행 완료

**상세 작업:**
- [x] 핑거프린트 유틸 구현: src/lib/fingerprint.ts
  - 클라이언트: @fingerprintjs/fingerprintjs로 브라우저 핑거프린트 생성
  - 서버: request IP 추출 (x-forwarded-for 헤더)
  - 결합: SHA-256 해시 생성 함수
- [x] GET /api/status/[orgId] 구현: src/app/api/status/[orgId]/route.ts
  - 기관 정보 조회
  - website 타입: 최신 ping 결과 확인 + 5분 경과 시 on-demand ping 실행
  - 최근 10분 제보 집계 (good/bad 카운트)
  - 전화 기관: 대기 인원 평균 계산
  - 최근 제보 5개 타임라인
  - 신호등 판정 로직 (PRD 판정 공식 기준)
  - 보조 메시지 생성
- [x] On-demand ping 내부 함수 구현: src/lib/ping.ts
  - URL로 GET 요청 (타임아웃 10초, User-Agent 설정)
  - 응답 시간 측정 + ping_results INSERT
  - 연속 실패 감지 → ping_enabled 업데이트
- [x] 신호등 판정 로직 유틸: src/lib/signal.ts
  - 웹사이트: ping 기반 판정 + 제보 보조 메시지
  - 전화: 제보 비율 기반 판정
  - 회색(정보 없음) 처리

**완료조건:**
- [x] GET /api/status/{orgId}에 정부24 orgId 넣으면 JSON 응답 정상 반환
- [x] 핑거프린트 생성 함수가 일관된 해시값 반환
- [x] 신호등 판정이 PRD 기준표대로 동작

---

## Chunk 3: 제보 API + 기관 등록 API

**목표:** 사용자 제보 접수 + 새 기관 등록 기능 완성

**선행조건:** Chunk 2 완료 (핑거프린트, status API 동작)

**상세 작업:**
- [x] POST /api/report 구현: src/app/api/report/route.ts
  - Request body 검증 (orgId, status 필수 / waitCount 선택)
  - fingerprint + orgId로 5분 내 중복 체크
  - waitCount 범위 검증 (0~999)
  - reports INSERT
  - 에러 응답: 400, 404, 429, 500
- [x] POST /api/organization 구현: src/app/api/organization/route.ts
  - Request body 검증 (name, type 필수 / url 또는 phone)
  - 기관 이름 길이 검증 (2~50자)
  - URL 정규화 (프로토콜 제거, trailing slash 제거, 소문자)
  - 전화번호 정규화 (하이픈 제거)
  - 중복 체크 (정규화된 값으로)
  - fingerprint로 24시간 내 등록 횟수 체크 (3개 제한)
  - organizations INSERT
  - 에러 응답: 400, 409, 429, 500

**완료조건:**
- [x] POST /api/report로 제보 성공 + 5분 내 재제보 시 429 응답
- [x] POST /api/organization으로 기관 등록 성공 + 중복 등록 시 409 응답
- [x] 잘못된 입력에 대해 적절한 에러 코드 반환

---

## Chunk 4: 메인 페이지 UI + 상태 카드

**목표:** 메인 페이지 레이아웃 + 기관 상태 카드 + 제보 기능 UI 완성

**선행조건:** Chunk 3 완료 (report API, status API 동작)

**상세 작업:**
- [x] 레이아웃 컴포넌트: src/app/layout.tsx
  - 시스템 폰트, Tailwind 기본 설정
  - 모바일 우선 레이아웃 (max-width 480px 중앙 컨테이너)
  - 메타 태그 (SEO 기본)
- [x] 메인 페이지: src/app/page.tsx
  - 서버 컴포넌트: Supabase에서 기관 목록 fetch
  - 헤더: "WaitFree" + "공공기관 지금 터졌나요?"
  - Preset 탭 영역 (정부24 / 국민건강보험공단)
  - 사용자 등록 기관 리스트 (아코디언)
  - "+ 다른 기관 추가하기" 버튼
- [x] 탭 컴포넌트: src/components/PresetTabs.tsx (클라이언트 컴포넌트)
  - 탭 전환 (URL 변경 없음)
  - 선택된 탭의 상태 카드 표시
- [x] 신호등 컴포넌트: src/components/TrafficLight.tsx
  - green/yellow/red/gray 상태별 색상 + glow 효과
  - 80px 이상 원형
- [x] 상태 카드 컴포넌트: src/components/StatusCard.tsx (클라이언트 컴포넌트)
  - 기관 이름 + 종류 뱃지
  - 신호등 (TrafficLight)
  - 제보 요약 텍스트
  - 제보 버튼 [👍 잘 돼요] [😡 안 돼요!]
  - 전화 기관: 대기 인원 입력 필드
  - 제보 완료 시 토스트 + 쿨다운 타이머
  - 웹사이트 기관: 마지막 ping 시간 + 보조 메시지
  - 최근 제보 타임라인 (5개)
- [x] 사용자 등록 기관 리스트: src/components/OrgList.tsx
  - 기관 카드 축소형 (이름 + 소형 신호등 + 종류 뱃지)
  - 클릭 시 아코디언 펼침 → StatusCard
  - 빈 상태: "아직 등록된 기관이 없어요"
- [x] 핑거프린트 Provider: src/components/FingerprintProvider.tsx
  - Context로 fingerprint 값 앱 전체에 제공
- [x] 토스트 컴포넌트: src/components/Toast.tsx
  - 제보 완료, 에러 메시지 표시 (3초 후 자동 닫힘)
- [x] 스켈레톤 UI: src/components/Skeleton.tsx
  - 로딩 중 신호등 모양 스켈레톤
- [x] 에러 상태 UI: src/components/ErrorState.tsx
  - 네트워크 오류 시 메시지 + 재시도 버튼

**완료조건:**
- [x] 메인 페이지에서 정부24, 건강보험공단 탭 전환 정상 동작
- [x] 상태 카드에서 신호등 + 제보 요약 정상 표시
- [x] 제보 버튼 클릭 → API 호출 → 성공 토스트 + 쿨다운 타이머 표시
- [x] 전화 기관에서 대기 인원 입력 가능
- [x] 모바일 뷰에서 깔끔하게 표시

---

## Chunk 5: 기관 등록 페이지 + Realtime

**목표:** 기관 등록 폼 + Supabase Realtime 실시간 반영

**선행조건:** Chunk 4 완료 (메인 페이지, 상태 카드 UI 동작)

**상세 작업:**
- [x] 기관 등록 페이지: src/app/add/page.tsx
  - ← 뒤로가기 버튼 + "새 기관 등록" 헤더
  - 폼: 기관 이름 + 종류 토글(웹사이트/전화) + URL 또는 전화번호 입력
  - 입력 검증 (클라이언트 사이드)
    - 기관 이름: 2~50자, 공백만 불가
    - URL: http:// 또는 https:// 시작
    - 전화번호: 숫자+하이픈만, 8자 이상
  - [등록하기] 버튼 → POST /api/organization 호출
  - 성공: "등록 완료!" 토스트 + 메인으로 이동
  - 409 (중복): "이미 등록된 곳이에요!" + 해당 기관 링크
  - 429 (제한): "오늘은 더 등록할 수 없어요"
- [x] Supabase Realtime 연결: src/hooks/useRealtimeReports.ts
  - reports 테이블 INSERT 구독
  - org_id 필터링
  - 새 제보 수신 시 상태 카드 데이터 갱신
  - 기관 전환 시 이전 구독 해제 + 새 구독
- [x] 오프라인/연결 끊김 감지: src/hooks/useConnectionStatus.ts
  - Supabase 채널 상태 모니터링
  - 끊김 시 배너 표시: "실시간 연결이 끊겼어요. 새로고침해주세요"
  - 재연결 시 GET /api/status 호출로 동기화
- [x] StatusCard에 Realtime 통합
  - useRealtimeReports 훅 연결
  - 새 제보 들어오면 카운트 + 타임라인 실시간 업데이트

**완료조건:**
- [x] /add 페이지에서 기관 등록 → 메인에서 즉시 표시
- [x] 중복 기관 등록 시도 시 적절한 에러 메시지
- [x] 브라우저 2개 열고 한쪽에서 제보 → 다른 쪽에서 실시간 반영
- [x] 네트워크 끊었다 연결 시 데이터 동기화

---

## Chunk 6: 마무리 (SEO + 에러 UI + 전체 점검)

**목표:** SEO 메타 태그, 에러 페이지, OG 이미지, 전체 점검

**선행조건:** Chunk 5 완료 (모든 기능 동작)

**상세 작업:**
- [ ] SEO 메타 태그 완성: src/app/layout.tsx
  - title, description, canonical
  - Open Graph: og:title, og:description, og:image, og:type
  - Twitter Card: twitter:card, twitter:title, twitter:description
- [ ] OG 이미지: public/og-image.png
  - 정적 이미지 (신호등 3개 일러스트) — 1200x630px
  - Next.js ImageResponse로 생성하거나 정적 파일 배치
- [ ] robots.txt: public/robots.txt (전체 허용)
- [ ] 404 페이지: src/app/not-found.tsx
  - "페이지를 찾을 수 없어요" + 메인으로 돌아가기 버튼
- [ ] 전역 에러 페이지: src/app/error.tsx
  - "문제가 생겼어요" + 다시 시도 버튼
- [ ] 전체 점검
  - 모든 API 엔드포인트 정상 동작 확인
  - 모바일 뷰 레이아웃 확인
  - 에러 상태 UI 확인 (네트워크 끊김, 잘못된 입력 등)
  - 한국어 텍스트 누락 확인
  - console 에러/경고 정리
- [ ] README.md 작성
  - 프로젝트 설명
  - 기술 스택
  - 로컬 실행 방법
  - 환경변수 목록
  - 배포 방법 (Vercel)
- [ ] 데이터 정리 SQL 안내 추가 (README에)

**완료조건:**
- [ ] SEO 메타 태그 정상 (개발자 도구에서 확인)
- [ ] OG 이미지 미리보기 정상
- [ ] 404, 에러 페이지 정상 표시
- [ ] 모바일 + 데스크탑 레이아웃 깨지지 않음
- [ ] README 완성
- [ ] 전체 기능 정상 동작
