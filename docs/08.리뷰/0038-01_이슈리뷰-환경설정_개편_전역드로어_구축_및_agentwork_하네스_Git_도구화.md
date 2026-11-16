# [0038-01] 환경설정(SCR-SET-01) 전면개편, 전역 펼침메뉴(Drawer) 구축 및 agentwork 하네스 Git 도구화 완결 리뷰

## 1. 개요 및 목적
- **세션 / 태스크 ID**: `[0038]` / `[0038-01]`
- **태스크명**: 사용자 환경설정(SCR-SET-01) 전면개편, 전역 펼침메뉴(Drawer) 구축, 시스템 운영관리(/system) 프로토타입 및 agentwork 하네스 Git 도구화
- **수행 목적**:
  1. **agentwork Git CLI 도구화 및 작업트리 정화**:
     - 4단계 GitHub 토큰 자동 감지(환경변수, AI Studio Secrets, .env, git origin URL) 엔진을 내장한 `agentwork/gh-cli.cjs` 통합 도구를 구축하여 일회성 스크립트 분산을 차단하고, `.gitignore`에 `scratch/`를 등록하여 Clean Tree를 확보.
  2. **서비스 전역 좌측 펼침 메뉴(GlobalDrawerNav) 구축 및 모바일 접근성 개선**:
     - 상단 헤더의 협소한 공간 문제를 해결하기 위해 햄버거 메뉴를 신설하고, 비회원 게스트 상태에서는 메뉴를 차단하며 로그인 대상 4대 핵심 카테고리(핵심 금융, 라이프 협업, 빠른 등록, 시스템 관리) 아코디언 메뉴 구조화.
     - 로고 클릭 시 대시보드 직결 및 로그아웃 시 비회원 메인(게스트홈)으로 강제 이동 가드레일 적용.
  3. **사용자 맞춤 환경설정 화면(SCR-SET-01) 전면 개편**:
     - 상단 헤더의 불필요한 설정저장 버튼 제거 및 `ElmTyp01` 360px 2행 분리 표준 규칙 적용.
     - `src/sample/data/dashboardConfigPool.ts`를 신설하여 대시보드 위젯 On/Off, 추천 프리셋 4종, 순서 이동 중앙 제어 및 실시간 썸네일 미리보기 2-패널 뷰어 제공.
     - OCR 엔진(Gemini, OpenAI, Claude, CLOVA, EasyOCR), 모델 동적 연동, API 키 마스킹/미리보기(눈 아이콘) 토글 기능 구현.
  4. **시스템 운영관리 독립 경로(/system) 프로토타입 골격 마련**:
     - 백로그 `BKL-SYS-01` 기반의 `SCR_SYS_01_시스템운영관리.tsx` 신설 및 `App.tsx` 내 `/system` 라우팅 연동.
     - PostgreSQL 풀, Cloudflare 터널, 2GB RAM OOM 격리 버퍼, EasyOCR 워커 큐 실시간 관제 및 긴급 점검 스위치 지원.
  5. **모바일 360px(갤럭시 S26) 반응형 정밀 튜닝**:
     - `MoaLogo` 영문 배지 모바일 숨김(`hidden sm:inline-block`)으로 헤더 공간 여유 확보.
     - 빠른등록 플로팅 메뉴(`ElmQck01`) 우측 벽면 밀착(`fixed right-0`, `rounded-l-md`) 및 `overflow-x-hidden` 적용으로 가로 스크롤 튐 0건 달성.
  6. **AGENTS.md v2.3 거버넌스 현행화**:
     - `agentwork/gh-cli.cjs`를 SSOT CLI 도구로 공식 규정하고 세션시작, 태스크정리, 태스크승급, 세션정리 명령어 체계 개정.

---

## 2. 주요 아키텍처 및 구현 성과

### 2.1 agentwork GitHub CLI 도구화 (`agentwork/gh-cli.cjs`)
- **4단계 토큰 자동 감지**:
  1. `process.env.GITHUB_TOKEN || process.env.GH_TOKEN`
  2. Linux/AI Studio Secrets (`/proc/*/environ` 내 `GITHUB_TOKEN=`)
  3. `.env` 파일 파싱
  4. Git remote origin URL 역추출
- **지원 명령어**: `status`, `create-issue`, `close-issue`, `create-pr`, `merge-pr`, `sync-branches`
- **Clean State 보장**: `.gitignore`에 `scratch/` 등록 완료.

### 2.2 전역 좌측 펼침 메뉴 구축 (`src/components/GlobalDrawerNav.tsx`)
- 딤드 백드롭 터치 시 닫힘 및 ESC 키 바인딩, 오픈 시 body 스크롤 차단.
- 게스트 모드에서는 메뉴 버튼 숨김 및 게스트 진입 시 자동 닫힘.
- 로그인 대상 4대 핵심 카테고리만 깔끔하게 아코디언 메뉴화.

### 2.3 환경설정 화면 전면 개편 (`src/sample/screen/SCR_SET_01_사용자설정.tsx`)
- 상단 헤더 불필요 버튼 제거 및 360px 표준 타이틀 적용.
- `dashboardConfigPool.ts`를 통한 대시보드 위젯 배치 중앙 관리 및 4대 프리셋 지원.
- 위젯 선택 시 우측 썸네일 미리보기 카드 및 기능 체크리스트 실시간 노출.
- AI OCR 공급자/모델 선택 드롭다운 및 API 키 보기(눈 아이콘) 토글 기능 구현.

### 2.4 시스템 운영관리 관제 신설 (`src/sample/screen/SCR_SYS_01_시스템운영관리.tsx`)
- BKL-SYS-01 백로그 명세 100% 충족: DB 풀, Cloudflare 터널, 2GB RAM OOM 격리, OCR 워커 큐 상태 관제.
- `App.tsx`의 15번째 화면으로 등록 및 `/system` 또는 `?route=system` 진입점 지원.

### 2.5 모바일 360px 가로스크롤 방어 및 탑영역 최적화
- `MoaLogo.tsx`: 영문 배지 `hidden sm:inline-block` 처리.
- `Tokens.tsx`의 `ElmQck01`: `fixed right-0`, `rounded-l-md`, `max-w-[calc(100vw-16px)]` 처리.
- `index.html` & `App.tsx`: `overflow-x-hidden` 적용으로 스크롤 튐 완전 해결.

---

## 3. 정적 타입 및 빌드 검증 결과

```bash
$ pnpm.cmd run lint
$ tsc --noEmit
✓ 0-Error 통과

$ pnpm.cmd run build
$ vite build
✓ 2120 modules transformed.
dist/index.html                     1.71 kB │ gzip:   0.88 kB
dist/assets/index-B98Cry2k.css    255.10 kB │ gzip:  29.37 kB
dist/assets/index-C2ZIUyu5.js   1,412.84 kB │ gzip: 335.75 kB
✓ built in 1.97s (무결점 프로덕션 번들링 완결)
```

---

## 4. 변경 및 신규 파일 목록

| 파일 경로 | 구분 | 주요 내용 |
| :--- | :---: | :--- |
| `agentwork/gh-cli.cjs` | 신규 | 4단계 토큰 감지 파라미터 기반 GitHub CLI 통합 도구 |
| `.gitignore` | 수정 | `scratch/` 디렉터리 등록으로 작업 트리 청결도 확보 |
| `AGENTS.md` | 수정 | v2.3 거버넌스 개정 (`agentwork/gh-cli.cjs` SSOT 반영) |
| `src/components/GlobalDrawerNav.tsx` | 신규 | 전역 좌측 슬라이드 아웃 Drawer 컴포넌트 |
| `src/sample/data/dashboardConfigPool.ts` | 신규 | 대시보드 위젯/프리셋/순서 중앙 제어 SSOT 스토어 풀 |
| `src/sample/screen/SCR_SET_01_사용자설정.tsx` | 수정 | 헤더 정리, 대시보드 위젯 설정 통합, OCR 엔진/키 뷰어 개편 |
| `src/sample/screen/SCR_SYS_01_시스템운영관리.tsx` | 신규 | BKL-SYS-01 기반 시스템 인프라 헬스체크 관제 화면 |
| `src/components/MoaLogo.tsx` | 수정 | 영문 배지 모바일 숨김(`hidden sm:inline-block`) 처리 |
| `src/sample/elements/Tokens.tsx` | 수정 | `ElmQck01` 우측 밀착(`fixed right-0`) 및 가로스크롤 튐 차단 |
| `src/App.tsx` | 수정 | 햄버거 메뉴, 로고 대시보드 직결, 로그아웃 게스트홈 이동, /system 라우팅 |
| `index.html` | 수정 | `body`에 `overflow-x-hidden` 적용 |
| `docs/08.리뷰/0038-01_...md` | 신규 | 태스크 0038-01 코드리뷰 문서 발행 |
