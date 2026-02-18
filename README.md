# WaitFree

공공기관 서버 폭주 / 전화 대기 상황을 실시간으로 보여주는 웹 서비스

## 주요 기능

- **실시간 신호등**: 공공기관 상태를 초록/노랑/빨강 신호등으로 한눈에 확인
- **자동 Ping**: 웹사이트 기관은 서버 응답 시간을 자동으로 측정
- **사용자 제보**: "잘 돼요" / "안 돼요!" 버튼으로 실시간 상태 공유
- **전화 대기 인원**: 전화 기관의 대기 인원 수를 사용자들이 공유
- **Realtime 반영**: Supabase Realtime으로 다른 사용자의 제보가 즉시 반영
- **기관 등록**: 사용자가 직접 새로운 공공기관을 추가 가능

## 기술 스택

| 기술 | 용도 |
|------|------|
| Next.js 16 (App Router) | 프레임워크 (SSR + API Routes) |
| Supabase | 데이터베이스 + Realtime |
| Tailwind CSS | 스타일링 |
| TypeScript | 타입 안전성 |
| Vercel | 배포 |
| @fingerprintjs/fingerprintjs | 사용자 식별 |

## 로컬 실행 방법

### 사전 준비

- Node.js 18 이상
- Supabase 프로젝트 (무료 플랜 가능)

### 설치

```bash
git clone https://github.com/jooladen/waitfree.git
cd waitfree
npm install
```

### 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Supabase 대시보드 > Settings > API에서 각 값을 확인할 수 있습니다.

### DB 마이그레이션

Supabase SQL Editor에서 다음 파일들을 순서대로 실행:

1. `prd/migration.sql` - 테이블 생성 + Seed 데이터
2. `prd/migration_chunk3.sql` - organizations 테이블에 created_by_fingerprint 컬럼 추가

### 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

### 빌드

```bash
npm run build
npm start
```

## 배포 (Vercel)

1. [Vercel](https://vercel.com)에 GitHub 저장소 연결
2. Environment Variables에 `.env.local`의 3개 변수 추가
3. 자동 배포 완료

## 데이터 정리

reports와 ping_results 테이블은 7일이 지난 데이터를 주기적으로 삭제해야 합니다.
Supabase SQL Editor에서 아래 쿼리를 실행하세요:

```sql
-- 7일 지난 제보 삭제
DELETE FROM reports WHERE created_at < NOW() - INTERVAL '7 days';

-- 7일 지난 핑 결과 삭제
DELETE FROM ping_results WHERE created_at < NOW() - INTERVAL '7 days';
```

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (SEO 메타 태그)
│   ├── page.tsx                # 메인 페이지
│   ├── not-found.tsx           # 404 페이지
│   ├── error.tsx               # 에러 페이지
│   ├── opengraph-image.tsx     # OG 이미지 생성
│   ├── twitter-image.tsx       # Twitter 이미지 생성
│   ├── add/page.tsx            # 기관 등록 페이지
│   └── api/
│       ├── report/route.ts     # 제보 API
│       ├── status/[orgId]/route.ts  # 기관 상태 API
│       └── organization/route.ts    # 기관 등록 API
├── components/
│   ├── ErrorState.tsx          # 에러 상태 UI
│   ├── FingerprintProvider.tsx # 핑거프린트 Context
│   ├── OrgList.tsx             # 사용자 등록 기관 리스트
│   ├── PresetTabs.tsx          # Preset 기관 탭
│   ├── Skeleton.tsx            # 로딩 스켈레톤
│   ├── StatusCard.tsx          # 기관 상태 카드
│   ├── Toast.tsx               # 토스트 알림
│   └── TrafficLight.tsx        # 신호등 컴포넌트
├── hooks/
│   ├── useConnectionStatus.ts  # Realtime 연결 상태
│   └── useRealtimeReports.ts   # 실시간 제보 구독
├── lib/
│   ├── constants.ts            # 상수 정의
│   ├── fingerprint.ts          # 핑거프린트 유틸
│   ├── ping.ts                 # On-demand ping
│   ├── signal.ts               # 신호등 판정 로직
│   └── supabase/
│       ├── client.ts           # 브라우저용 Supabase 클라이언트
│       ├── server.ts           # 서버용 Supabase 클라이언트
│       └── admin.ts            # Service Role 클라이언트
└── types/
    └── index.ts                # TypeScript 타입 정의
```
