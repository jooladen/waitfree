# CLAUDE.md — WaitFree 작업 규칙서

## 프로젝트 정보
- **프로젝트:** WaitFree (공공기관 실시간 상태 확인 서비스)
- **GitHub:** https://github.com/jooladen/waitfree
- **기술 스택:** Next.js 16 (App Router), Supabase, Tailwind CSS, TypeScript, Vercel

---

## 기본 규칙
- 항상 한국어로 응답
- 작업 시작 시 prd/HANDOFF.md와 prd/chunk_roadmap.md 먼저 읽기
- prd/PRD.md는 기능 상세가 필요할 때 참고

---

## 작업 방식
- 미완료 Chunk만 순서대로 작업
- 한 번에 여러 Chunk 절대 금지
- chunk_roadmap에 없는 기능 임의 추가 금지
- 애매하면 질문하지 말고 최선의 판단으로 진행, prd/HANDOFF.md에 판단 근거 기록

---

## 기존 프로젝트 처리
- package.json 있으면 프로젝트 생성 스킵, 없는 패키지만 추가
- 이미 있는 파일/폴더 덮어쓰지 않음

---

## .env.local 규칙
- Chunk 1에서 빈칸으로 생성
- 이미 존재하면 절대 건드리지 않음
- 필요 변수:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```

---

## Chunk 완료 시 필수 절차
1. prd/HANDOFF.md 업데이트 (마지막 완료, 현재 상태, 다음 작업, 히스토리)
2. prd/chunk_roadmap.md 체크박스 [x] 체크
3. git add → commit → push
   - 커밋 메시지: "Chunk N: 한 줄 요약"
4. "Chunk N 완료" 출력

---

## Git 규칙
- Chunk 완료 시에만 commit + push
- 첫 push: `git push -u origin main`
- 이후: `git push`

---

## 코드 규칙
- TypeScript strict 모드
- 상수는 src/lib/constants.ts에 정의 (매직 넘버 금지)
- API Route에서 에러 처리: try-catch + 적절한 HTTP 상태 코드
- 사용자에게 노출되는 모든 텍스트는 한국어
- 컴포넌트 파일명: PascalCase (예: StatusCard.tsx)
- 유틸/훅 파일명: camelCase (예: fingerprint.ts, useRealtimeReports.ts)
- Tailwind CSS만 사용 (별도 CSS 파일 금지)
- console.log 남기지 않기 (개발 중 디버깅용도 커밋 전 제거)
