# [코드리뷰] Session 0055: React/FSD 기반 구조 집중 리뷰 및 전체 구조 리뷰 로드맵

- **세션 ID**: `0055`
- **문서 유형**: 집중 코드리뷰 (1단계: 기반 구조 + 전체 구조 리뷰 마스터 로드맵)
- **원격 이슈**: [#150 [0055] React/FSD 기반 구조 집중 리뷰](https://github.com/jkoogit/moabogo/issues/150)
- **리뷰 브랜치**: `task/0055_01_react_fsd_foundation_review` (산출물 전용, 읽기 전용 검토)
- **고정 기준선 SHA (`origin/dev` HEAD)**: `e1dc87c84795f50e3ed7d2280e8f2837ea8b40d4`
- **기준일**: 2026-11-28
- **연관 참고자료**: [0055-02 React 핵심 개념과 프로젝트 적용](./0055-02_참고자료-React핵심개념과프로젝트적용.md)
- **파생 작업계획**: [0055-03 FSD 기반 구조·계약 단일화 및 DI 격리 작업계획](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md)
- **운영 근거**: [리뷰 운영 하네스](../../README.md)

---

## 1. 리뷰 목적 및 운영 원칙

본 문서는 MoaBogo 프론트엔드(`src/` 187개 `.ts`/`.tsx` 파일, 총 86,768줄 + 루트 `server.ts` 1,840줄)의 구조적 건전성을 5단계로 점진 감사하기 위한 **마스터 리뷰 로드맵**을 수립하고, 그 첫 번째 단계인 **1단계(기반 구조: 저장소·폴더·모듈 경계, 의존성 방향·순환참조, 루트 계약·DI/허니팟 격리 경계)**를 읽기 전용으로 진단한 결과를 기록한다.

1. **고정 기준선 원칙**: 전체 구조 감사의 모든 후속 영역 리뷰는 별도 합의가 없는 한 최초 기준선인 `origin/dev` HEAD SHA `e1dc87c84795f50e3ed7d2280e8f2837ea8b40d4`를 공통 기준으로 유지한다.
2. **읽기 전용 및 기록 불변성**: 리뷰 세션에서는 제품 코드(`src/`, `server.ts`, 설정 파일) 및 기존 기록(`docs/05.계획/`, `docs/07.회고/`, 과거 리뷰 문서)을 수정하지 않는다. 완료된 본 로드맵은 후속 세션에서 덮어쓰지 않고, 각 후속 리뷰 문서에 부모 로드맵 링크와 최신 상태 스냅샷을 남긴다.
3. **구현 분리 원칙**: 본 리뷰에서 도출된 수정·리팩토링 요구사항은 파생 작업계획([0055-03](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md))으로 묶어 승인한 뒤, 이후 독립된 세션작업(`#세션시작` ➔ `#태스크시작` ➔ `#태스크처리`)에서 구현한다. 2차 우선작업계획 5순위 백엔드 착수(`BKL-DATA-01` Phase 1)는 리뷰 이후 다음 사용 가능 세션으로 이관한다.
4. **참고자료 분리 승인**: [리뷰 운영 하네스](../../README.md) 4장에 따라, 기반 구조 리뷰의 이해와 설계 논의에 필요한 React 핵심 개념·저장소 실제 코드 예시·설계상 의미는 본 코드리뷰 문서와 분리된 신규 참고자료([0055-02](./0055-02_참고자료-React핵심개념과프로젝트적용.md))로 작성한다.

---

## 2. 전체 프론트엔드 구조 리뷰 마스터 로드맵 (1~5단계)

### 2.1 시스템 기준선 및 제외 범위

- **대상 시스템 기준선**: `e1dc87c84795f50e3ed7d2280e8f2837ea8b40d4` (`origin/dev`, React 19 + Vite 6 + TypeScript 5.7 + Tailwind CSS v4 + Express `server.ts`)
- **공통 참조 아키텍처 규범**:
  - [리팩토링 전략 가이드](../../../02.아키텍처/02-리팩토링전략가이드.md)
  - [소스코드 및 UI/UX 리팩토링 표준지침](../../../02.아키텍처/04-소스코드_및_UIUX_리팩토링_표준지침.md)
  - [라이프도메인 서비스독립성 플러그인 및 보안설계서](../../../02.아키텍처/05-라이프도메인_서비스독립성_플러그인_및_보안설계서.md)
- **전체 리뷰 공통 제외 범위**:
  - 제품 코드·스타일·설정 수정 및 즉시 리팩토링 착수
  - 백엔드(`BKL-DATA-01` PostgreSQL 16 실 DB 구축 및 API 영속화) 신규 구현 ([2차 우선작업계획](../../../05.계획/261125_2차계획_백엔드착수전_데이터모델링_및_아키텍처정비_로드맵.md) 5순위는 후속 구현 세션 이관)
  - `node_modules/`, `dist/`, 정적 이미지 바이너리(`public/images/`) 내부 감사

### 2.2 단계별 리뷰 로드맵 및 완료 조건

| 단계 | 영역 | 핵심 검토 범위 | 완료 조건 (Exit Criteria) | 현재 상태 | 대상/예정 세션 |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **1단계** | **기반 구조** | 저장소 루트(`server.ts`·`types.ts`)·`src/` 최상위 레이어 경계(`components`/`context`/`hooks`/`services`/`sample`), FSD 계층 매핑 및 의존성 방향(역방향/수평 `import`), 순환참조 전수 점검, 화면 더미데이터 DI·허니팟 격리 경계 + React 핵심 개념 참고자료(`0055-02`) 분리 작성 | `src/` 187개 `.ts`/`.tsx` 및 `server.ts` 정적 의존 그래프·순환참조·역방향/수평 경계 위반 전수 식별, 우선순위별 발견사항 기록, 작업계획(`0055-03`) 및 참고자료(`0055-02`) 연결 완료 | **검토완료** | **`0055`** |
| **2단계** | **공통 기반** | 공통 UI 컴포넌트(`src/components/`, `src/sample/elements/Tokens.tsx`), 디자인 토큰(`src/index.css`, `ELM-*`) 정의·사용·누락·중복, 접근성·360px 반응형·`AppErrorBoundary` 격리 구조 | 공통 UI 계층의 중복·토큰 이탈·접근성/반응형 위반 근거 및 작업계획 도출 | **미검토** | 차기 리뷰 세션 |
| **3단계** | **도메인·서비스** | `src/services/`, `src/sample/data/`, `src/sample/shared/`, 도메인 모델·Repository·`syncEngine`·`offlineQueueStore` 경계, OOP/DIP/FSM/Plugin Registry 적합성 | 서비스·저장소·포트 경계 및 도메인 간 결합도·계약 일관성 진단 및 작업계획 도출 | **미검토** | 차기 리뷰 세션 |
| **4단계** | **화면별 구조** | `src/sample/screen/` 21개 화면 및 10개 하위 도메인 폴더 책임 분리, 파일 크기 상한(350~500줄), 중복 패턴, 화면별 실행 가능한 개선계획 | 21개 화면별 책임·비대 모듈·중복 현황 전수 표 및 우선순위별 개선 작업계획 수립 | **미검토** | 차기 리뷰 세션 |
| **5단계** | **운영·품질 횡단 검토** | 비동기 경합·오류/로딩/복구·캐시·동기화/원자성(`syncEngine`, `apiClient`), 테스트 전략·커버리지·테스트 용이성, 성능/번들·관측 가능성, PII/딥링크/스토리지 보안 경계 | 횡단 품질·보안·테스트 공백 진단 및 전체 리뷰 종합 작업계획 통합 | **미검토** | 차기 리뷰 세션 |

---

## 3. 공통 판단 기준 (후속 영역 리뷰 재사용 규격)

1. **우선순위(심각도) 정의**:
   - `P0` (즉시 대응): 데이터 손실, 보안·PII 침해, 핵심 런타임/동기화 흐름 중단 또는 순환참조로 인한 초기화 실패 위험
   - `P1` (높음): 주요 기능 확장·유지보수에 큰 구조적 비용을 유발하거나 아키텍처 핵심 경계(단방향 의존성, 레이어 격리)를 훼손하는 결함
   - `P2` (보통): 제한된 영향 범위이나 반복되는 구조적 비용·인지 부하·명명/배치 비일관성
   - `P3` (낮음): 가독성·탐색성·미래 확장을 위한 개선 기회
2. **판단 확신도 정의**:
   - `높음`: 정적 `import` 그래프, 컴파일/도구 출력, 파일·라인 코드 근거로 100% 확인됨
   - `보통`: 정적 구조상 확인되나 런타임 실행 경로 또는 동적 조건에 따른 영향 범위는 추가 검증이 필요함
   - `낮음`: 구조적 징후가 있으나 실행·테스트 부재로 가설 단계이며 검증 과제로 분리 필요
3. **발견사항 필수 기록 8대 항목**:
   - 근거(파일·라인 또는 모듈 경로), 현재 동작, 영향 범위, 우선순위(`P0`~`P3`), 확신도(`높음/보통/낮음`), 관련 의존성·미검증 영역, 개선 권고안, 측정 또는 재현 가능한 완료·검증 조건

---

## 4. 1단계 [0055] 기반 구조 리뷰 범위

### 4.1 포함 범위 (In-Scope)

1. **저장소 및 진입점 구성**: 루트(`index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `server.ts`)와 `src/main.tsx`, `src/App.tsx`, `src/types.ts` 간 역할·계약·중복 여부
2. **폴더·레이어 구조 및 FSD 정합성**: `src/components/`, `src/context/`, `src/hooks/`, `src/services/`, `src/sample/` (`data/`, `elements/`, `shared/`, `utils/`, `screen/`, `dutyStore.ts`) 간의 실제 계층 위상
3. **모듈 경계 및 의존성 방향**: 단방향 의존 준수 여부, 역방향 `import`, 화면 간 수평 `import`, 화면-더미데이터 결합 및 DI 경계, 미연결 고아(Orphan) 모듈 여부
4. **순환참조 전수 점검**: `src/` 전체 187개 `.ts`/`.tsx` 파일의 TypeScript AST(`ts.createSourceFile`) 기반 정적 `import`/`export ... from` 그래프 및 Tarjan SCC 순환 사이클 전수 검사

### 4.2 이번 세션 제외 영역 (Out-of-Scope)

- 디자인 토큰 세부 스타일·360px 반응형·접근성 전수 검사 (➔ 2단계)
- 도메인 모델/Repository 내부 로직 및 `ledgerTransferBridge`/`securityGuards` 세부 검증 (➔ 3단계)
- 21개 화면 내부 JSX 분량 및 UI 상태 분기 리팩토링 설계 (➔ 4단계)
- 런타임 프로파일링·브라우저 E2E·서버 침투 테스트 (➔ 5단계)

---

## 5. 상태 스냅샷

| 항목 | 상태 | 비고 |
| :--- | :---: | :--- |
| 기준선 고정 (`e1dc87c84795f50e3ed7d2280e8f2837ea8b40d4`) | **완료** | `origin/dev` HEAD와 100% 일치 |
| 1단계: 기반 구조 (저장소·폴더·모듈 경계, 의존성 방향·순환참조) | **검토완료 (`#리뷰정리` 마감)** | 발견사항 7건(`P1` 4건, `P2` 3건) 도출, 단위 커밋 마감 (일괄 PR·승급은 `#세션정리` 수행) |
| 2~5단계: 공통 기반 / 도메인·서비스 / 화면별 구조 / 운영·품질 | **미검토** | 후속 리뷰 세션 순차 진행 |
| 승인된 신규 참고자료 (`0055-02`) | **작성완료** | [0055-02_참고자료-React핵심개념과프로젝트적용.md](./0055-02_참고자료-React핵심개념과프로젝트적용.md) |
| 파생 작업계획 (`0055-03`) | **작성완료** | [0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md) |

---

## 6. 정적 구조 및 의존성 그래프 측정 결과 (기준선 `e1dc87c8`)

TypeScript AST(`ts.createSourceFile`) 기반으로 `src/` 전체 `.ts`/`.tsx` 파일 **187개**(총 **86,768줄**) 및 루트 `server.ts`(**1,840줄**)를 전수 스캔한 결과는 다음과 같다.

### 6.1 레이어별 코드 분포 및 건전 지표

| 레이어 경로 | 파일 수 | 총 줄 수 | FSD 대응 계층 (현재 실체) | 비고 |
| :--- | :---: | :---: | :--- | :--- |
| `src/` 루트 (`main.tsx`, `App.tsx`, `types.ts`) | 3 | 1,258 | `app` + `shared/types` 혼재 | `App.tsx` 971줄(970줄+EOF), `types.ts` 269줄 |
| `src/context/` | 1 | 92 | `app/providers` (`ThemeContext`) | 상향 역참조 **0건** (건전) |
| `src/hooks/` | 1 | 131 | `shared/lib` (`useApi`) | 상향 역참조 **0건**, 단 **사용처 0건(Orphan)** |
| `src/services/` (`repositories/` 포함) | 10 | 1,161 | `shared/api` + 도메인 Repo 의도 | `sample/data`·`sample/screen` 역참조 **11건** |
| `src/components/` (`game/`, `ledger/` 포함) | 44 | 16,665 | `shared/ui` + `features/widgets` 혼재 | `sample/*` 역참조 **24건**, 미연결 파일 6건 |
| `src/sample/shared/` | 5 | 1,367 | `shared/lib` (보안·포트 코어) | `sample/screen`·`data` 역참조 **0건** (`Elements` 1건만 참조) |
| `src/sample/utils/` | 1 | 1,001 | `shared/lib` (`gameResultCardCanvas`) | 상향 역참조 **0건** (건전) |
| `src/sample/elements/` | 1 | 4,246 | `shared/ui` (`Tokens.tsx`) | 사실상 전역 디자인 토큰 단일 파일 |
| `src/sample/data/` | 9 | 4,818 | Mock/로컬스토리지·IDB 풀 | `sample/screen` 역참조 **3건** |
| `src/sample/` 루트 (`dutyStore.ts`) | 1 | 985 | `entities/duty` 임시 스토어 | `sample/data`와 위상 불명확 |
| `src/sample/screen/` (`SCR_*` + 10개 폴더) | 111 | 55,044 | `pages` + `widgets` + `features` 혼재 | `sample/data` 직접 참조 **67건**, 수평 침범 **11건** |
| **프론트엔드 합계 (`src/` `.ts`/`.tsx`)** | **187** | **86,768** | — | 정적 순환참조 **0건**, 동적 `import()` **0건** |
| 루트 `server.ts` | 1 | 1,840 | 모놀리식 Mock 백엔드 + Vite 서빙 | `startServer()` 단일 함수 1,414줄 |

### 6.2 긍정 확인 사항 (Healthy Baseline)
- **정적 순환참조 0건**: `import type` 포함 및 런타임 전용 그래프 모두에서 Tarjan SCC 사이클 **0건** 확인 (`[0053-00]` 정리 상태 유지).
- **미해결 상대 경로 import 0건**: `src/` 내 상대 경로 import 전수 해석 성공.
- **하위 코어의 상향 역참조 없음**: `src/hooks/`, `src/context/`, `src/sample/shared/`, `src/sample/utils/`는 상위 화면(`sample/screen`)이나 데이터 풀(`sample/data`)을 참조하지 않음.
- **전략 플러그인 레지스트리 경계 정착**: `routine/plugins/`와 `goal/plugins/`는 계약 파일(`pluginContract`)과 `registry.ts` 패턴으로 분리되어 있음 (단 `goal/plugins/`가 `sample/data/goal-mock-data.ts`를 직접 import하는 점은 `FND-03`에서 다룸).

---

## 7. 1단계 기반 구조 발견사항 (Findings)

### `[FND-01]` `services/` 계층의 `sample/data`·`sample/screen` 역방향 의존 및 DI 부재
- **우선순위 / 확신도**: **`P1` (높음)** / **확신도: `높음`**
- **근거 (파일·라인)**:
  - `src/services/apiClient.ts:6` ➔ `src/sample/data/offlineSessionStore.ts`
  - `src/services/syncEngine.ts:10,19,24` ➔ `src/sample/data/offlineQueueStore.ts`, `servicePreferencesPool.ts`, `src/sample/shared/securityGuards.ts`
  - `src/services/repositories/offlineRepository.ts:6,14,23` ➔ `offlineQueueStore.ts`, `offlineSessionStore.ts`, `servicePreferencesPool.ts`
  - `src/services/repositories/preferencesRepository.ts:7,23,28,36` ➔ `servicePreferencesPool.ts`, `accountStorePool.ts`, `systemGovernancePool.ts` 및 **상위 화면 폴더 `src/sample/screen/day/types.ts:36`**
  - `src/services/repositories/ledgerRepository.ts:51-68` ➔ `DEFAULT_FALLBACK_LEDGERS` 더미 배열 내장
- **현재 동작**: 백엔드 API 추상화 계층(`src/services/`)이 런타임에 `src/sample/data/`와 `src/sample/screen/`을 직접 import해 강결합되어 있다. `repositoryContract.ts:8`에 `DataSourceMode`가 선언되어 있으나 `preferencesRepository`·`offlineRepository`는 모드 전환이나 구현체 주입 없이 로컬 풀 함수를 직통 호출한다.
- **영향 범위**: `src/services/` 전체, `SCR_OFF_01`, 향후 `BKL-DATA-01` 실 DB API 어댑터 교체 작업 및 운영 번들에서 `sample/data/` 분리 불가.
- **관련 의존성 / 미검증 영역**: `syncEngine`의 IndexedDB 큐 재연동 및 `offlineSessionStore` 토큰 주입 런타임 경로(5단계 횡단 검증 대상).
- **개선 권고안**: `src/services/`에 순수 포트 인터페이스(`I*Repository`, `ISessionTokenProvider`, `IOfflineQueueStorage`)만 남기고, 로컬/Mock 구현체는 어댑터로 분리해 최상위 조립부(`RepositoryProvider`)에서 주입한다. `day/types.ts`의 공용 설정 타입(`DisplaySettings`)은 공유 계약 계층으로 내린다.
- **완료·검증 조건**: 정적 의존성 검사에서 `src/services/**` ➔ `src/sample/**` import **0건** 달성 및 `npx.cmd tsc --noEmit`, `npm.cmd run build` 0-Error 통과. (➔ [WP-02](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-02))

---

### `[FND-02]` `server.ts` ↔ `src/types.ts` 계약 중복·드리프트, `startServer()` 비대화 및 한글 JSDoc 부재
- **우선순위 / 확신도**: **`P1` (높음)** / **확신도: `높음`**
- **근거 (파일·라인)**:
  - 중복 선언 6종: `User`, `Ledger`, `Transaction`, `StandaloneEvent`, `MoaAllowance`, `MoaLoan`이 `server.ts:7-122`와 `src/types.ts:1-197`에 각각 독립 선언됨.
  - **스키마 드리프트 (`MoaDuty`)**: `server.ts:80-94`의 `MoaDuty`는 구형 단순 필드(`status: 'ASSIGNED' | 'ENDED' | 'COMPLETED'`)만 보유한 반면, `src/types.ts:130-169`의 `MoaDuty`는 직교 3상태머신(`progress_status`, `settlement_status`, `evaluation_status`), `rotation_policy`, `cycle_config` 등으로 확장되어 상호 불일치함.
  - **거대 단일 함수 몰빵**: `server.ts` 전체 1,840줄 중 `startServer()` 1개 함수(`L422-1835`, **1,414줄**) 안에 미들웨어, 인증, 가계부·거래, 오프라인 배치·LWW 충돌해결(`L569-831`), OCR 시뮬레이션(`L834-907`), 이벤트(`L910-1021`), 당번·용돈·빌림(`L1024-1233`), 게임방 SSE/액션 릴레이(`L1239-1791`), Vite/SPA 서빙(`L1796-1830`)까지 9개 책임이 혼재됨.
  - **도메인 한글명 JSDoc 부재 및 시드 PII 잔존**: `server.ts:7-122` 및 `src/types.ts:1-269` 인터페이스·필드에 `00.데이터표준정의서` 기준 한글명 JSDoc이 거의 없고, `server.ts:125-160` 시드에 실명·개인 이메일 형태(`jkok2j2m@gmail.com`, `구본영(호스트)`)가 잔존함.
- **현재 동작**: 프론트엔드(`src/types.ts`)와 백엔드(`server.ts`)가 공유 타입 없이 각자 인터페이스를 유지하며 `MoaDuty` 계약이 이미 어긋나 있고, API 변경 시 컴파일러가 불일치를 잡아내지 못한다.
- **영향 범위**: 백엔드 `BKL-DATA-01` API/DB 1:1 대사, `financeRepository`/`ledgerRepository` DTO 변환, 게임방 실시간 릴레이 유지보수 및 향후 허니팟 미끼 데이터 스키마 현행화.
- **관련 의존성 / 미검증 영역**: `server.ts`의 Express 런타임 엔드포인트와 `src/services/repositories/*Dto` 간 snake↔camel 필드 전수 대사는 3단계 도메인·서비스 검토 대상.
- **개선 권고안**: ① `shared/contracts/`(또는 `src/contracts/`)를 단일 진실 원천으로 분리해 `server.ts`·`src/`가 공통 import하고 모든 인터페이스·필드에 한글 도메인명 JSDoc 병기, ② 시드 데이터를 순수 합성 가명 데이터로 정제, ③ `startServer()`를 도메인 라우터·인메모리/디코이 스토어·Vite 서빙 모듈로 분해(실 DB `BKL-DATA-01` 골격 착수와 통합 또는 선행 분리).
- **완료·검증 조건**: `server.ts`와 `src/types.ts` 간 중복 인터페이스 선언 0건, 공유 계약 파일의 `tsc --noEmit` 0-Error 통과, `server.ts` 엔트리 함수가 라우터 마운트·서버 부팅 책임만 보유. (➔ [WP-01](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-01), [WP-05](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-05))

---

### `[FND-03]` 화면의 더미데이터 직접 결합(67건), 미사용 API 계층(Orphan 8모듈) 및 허니팟 격리 미비
- **우선순위 / 확신도**: **`P1` (높음)** / **확신도: `높음`**
- **근거 (파일·라인)**:
  - **화면 ➔ `sample/data` 직접 import 67건**: 21개 `SCR_*.tsx` 중 9개(`SCR_AUT_01`, `SCR_AUT_02`, `SCR_DSH_01`, `SCR_GAM_01`, `SCR_GNT_01`, `SCR_GOL_01`, `SCR_MYP_01`, `SCR_OFF_01`, `SCR_SET_01`) 및 하위 컴포넌트/훅이 `sample/data/*`를 총 67회 직접 import.
  - **Repository/Hook 계층 실화면 미연결**: 21개 `SCR_*.tsx` 중 `src/services/`를 import하는 화면은 `SCR_OFF_01_오프라인동기화.tsx` **단 1개**(`hooks/useApi.ts` 사용 화면 **0개**).
  - **Orphan(`inDegree === 0`) 8모듈**: `src/hooks/useApi.ts`, `src/services/index.ts`, `src/components/Header.tsx`, `src/components/OfflineStaleWarningModal.tsx`, `src/components/EventModal.tsx`, `src/components/OCRScannerModal.tsx`, `src/components/SettingsModal.tsx`, `src/components/TransactionModal.tsx`.
- **현재 동작**: `[0053-01]`에서 구축된 `useApi`와 모달 5종 중 4종(`EventModal`, `OCRScannerModal`, `SettingsModal`, `TransactionModal`)이 실제 `App.tsx`·`SCR_*` 트리에서 사용되지 않은 채 유휴 상태이며, 실제 화면들은 `sample/data/*` 또는 파일 내부 하드코딩 초기값으로 동작한다. 또한 더미데이터가 운영 프론트엔드 번들 경로(`src/sample/data/`)에 그대로 묶여 있다.
- **영향 범위**: 백엔드 연결 시 21개 화면 내부 수정이 강제되어 변경 비용이 급증하며, 운영 빌드 시 더미데이터 노출·장애 폴백 혼선 및 향후 AI 해킹 미끼(Honeypot/Decoy) 전략 구현 시 번들 분석을 통한 기만 노출 위험이 발생한다.
- **관련 의존성 / 미검증 영역**: 21개 화면별 내부 `useState` 초기 더미 규모 및 모달 4종 대체 화면(`SCR_QCK_01` 등) 기능 비교는 4단계에서 정밀 확인.
- **개선 권고안**: ① 화면(`SCR_*`)이 `sample/data`를 직접 import하지 않고 도메인 Hook/Port(`I*Repository`)로 값을 주입받도록 DI 경계 구축(백엔드 연결 시 어댑터만 교체해 화면 수정 0줄 달성), ② 미연결 Orphan 8모듈의 통합/제거 여부 결정, ③ 운영 클라이언트 번들에서 더미데이터를 물리 격리하고, 공유 타입 계약을 `satisfies`하는 **서버 측 격리 허니팟(`DecoyFixture`)**으로 이관해 스키마 변경 시 자동 현행화.
- **완료·검증 조건**: `src/sample/screen/**` ➔ `src/sample/data/**` 직접 import **0건**, `inDegree === 0` 유휴 모듈 **0건**, 프로덕션 Vite 빌드 번들에 개발용 Mock 픽스처 미포함 검증. (➔ [WP-02](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-02), [WP-03](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-03))

---

### `[FND-04]` `src/components/`의 `src/sample/` 역방향 의존(24건) 및 공용 UI 계층 이원화
- **우선순위 / 확신도**: **`P1` (높음)** / **확신도: `높음`**
- **근거 (파일·라인)**:
  - `src/components/game/*` ➔ `sample/*` **15건**: `LadderGameZone.tsx:32,61,62,63`, `RouletteGameZone.tsx:18,45,52,53`, `SettlementGameZone.tsx:14,18`, `ladderEngine.ts:8`, `LadderModals.tsx:5`, `ladderSyncChannel.ts:2`, `roulette/types.ts:2`, `game/types.ts:1` ➔ `Tokens.tsx`, `systemStorePool.ts`, `systemGovernancePool.ts`, `gameResultCardCanvas.ts` 참조.
  - `src/components/ledger/modals/*` ➔ `src/sample/elements/Tokens.tsx` **7건** (`LedgerBankImportModal` 등 7개 모달).
  - `src/components/OCRScannerModal.tsx:9`, `TransactionModal.tsx:6` ➔ `src/sample/shared/securityGuards.ts` **2건**.
- **현재 동작**: FSD 상 최하위 공용 레이어로 취급되어야 할 디자인 토큰(`Tokens.tsx`), 보안 가드(`securityGuards.ts`), 캔버스 유틸(`gameResultCardCanvas.ts`)이 `src/sample/` 아래에 위치해 있어, `src/components/`가 `src/sample/`로 거꾸로 내려다보는 기형적 의존 방향이 고착되어 있다. 또한 `src/components/` 안에 순수 원자 UI(`ThemeToggle`, `MoaLogo`)와 도메인 위젯(`game/ladder`, `ledger/modals`)이 혼재되어 있다.
- **영향 범위**: `sample/` 디렉터리를 점진적으로 해체하거나 프로덕션 FSD 계층(`shared/`, `entities/`, `features/`, `widgets/`)으로 승격할 때 경로 충돌 및 대규모 import 수정 유발.
- **관련 의존성 / 미검증 영역**: `Tokens.tsx`(4,246줄) 내부 컴포넌트 분할 및 토큰 일관성은 2단계 공통 기반 리뷰 범위.
- **개선 권고안**: `src/sample/elements/`, `src/sample/shared/`, `src/sample/utils/`의 순수 공용 코어를 `src/shared/`(`shared/ui`, `shared/lib/security`, `shared/lib/canvas`)로 승격하고, `components/game`·`components/ledger`는 `features/` 또는 `widgets/` 경계로 위상을 재정렬한다.
- **완료·검증 조건**: `src/components/**`(또는 재편 후 `shared/ui`) ➔ `src/sample/**` import **0건**. (➔ [WP-04](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-04))

---

### `[FND-05]` `src/sample/data/`의 상위 화면 도메인 역방향 의존(3건)
- **우선순위 / 확신도**: **`P2` (보통)** / **확신도: `높음`**
- **근거 (파일·라인)**:
  - `src/sample/data/servicePreferencesPool.ts:7` ➔ `src/sample/screen/car/types.ts`
  - `src/sample/data/servicePreferencesPool.ts:8` ➔ `src/sample/screen/car/carMockData.ts`
  - `src/sample/data/servicePreferencesPool.ts:9` ➔ `src/sample/screen/day/types.ts`
- **현재 동작**: 데이터 저장소 풀 계층(`sample/data/`)이 상위 화면 도메인(`sample/screen/car/`, `day/`)의 타입뿐 아니라 `INITIAL_VEHICLES`, `INITIAL_CAR_SETTINGS` 등 화면용 Mock 초기 데이터까지 역으로 import한다. (그리고 `preferencesRepository.ts`가 이를 다시 참조해 `services ➔ data ➔ screen` 3단 역방향 사슬이 형성됨.)
- **영향 범위**: `CAR`/`DAY` 도메인 화면 구조 개편 시 `servicePreferencesPool` 및 `preferencesRepository`가 함께 영향받으며, `sample/data/`를 독립 어댑터나 허니팟 픽스처로 분리하기 어렵게 만든다.
- **관련 의존성 / 미검증 영역**: `carMockData.ts` 내부 구조와 `useMoaCar.ts` 결합도는 3/4단계 검토 대상.
- **개선 권고안**: `Vehicle`, `CarUserSettings`, `DisplaySettings` 타입은 공유 계약 계층으로 내리고, 기본 초기 시드값은 `LocalMockAdapter` 내부로 이동시켜 데이터 풀이 화면 폴더를 참조하지 않도록 단절한다.
- **완료·검증 조건**: `src/sample/data/**` ➔ `src/sample/screen/**` import **0건**. (➔ [WP-02](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-02))

---

### `[FND-06]` `src/sample/screen/` 도메인 간 수평 교차 참조(8건) 및 `SCR_*` 직접 참조(3건)
- **우선순위 / 확신도**: **`P2` (보통)** / **확신도: `높음`**
- **근거 (파일·라인)**:
  - **화면 셸(`SCR_*`) 직접 import (3건)**:
    - `SCR_DSH_01_로그인메인대시보드.tsx:13` ➔ `SCR_LED_01_그룹가계부관리상세.tsx` (`CartoonStackedBookObject`, `getThicknessScale`, `LedgerBook`)
    - `SCR_DSH_01_로그인메인대시보드.tsx:59,60` ➔ `SCR_QCK_01_빠른머니등록.tsx`, `SCR_QCK_02_빠른수행등록.tsx`
  - **도메인 하위 폴더 간 수평 교차 참조 (8건)**:
    - `screen/dashboard/BentoLifeServiceCards.tsx:15,16,21,28,29` ➔ `screen/routine/` 3건 + `screen/car/` 2건 (`routineMockData`, `pluginSettings`, `routine/types`, `carMockData`, `useMoaCar`)
    - `screen/settings/CarSettingsPanel.tsx:15` ➔ `screen/car/types.ts`
    - `screen/settings/DaySettingsPanel.tsx:3` ➔ `screen/day/types.ts`
    - `screen/settings/ThemeRoutinePriorityTabs.tsx:5` ➔ `screen/routine/plugins/pluginSettings.ts`
- **현재 동작**: [ARCH-05](../../../02.아키텍처/05-라이프도메인_서비스독립성_플러그인_및_보안설계서.md)에서 `Zero Horizontal Import`를 원칙으로 두고 있으나, 대시보드(`DSH`)와 설정(`SET`)이 타 도메인(`LED`, `QCK`, `ROU`, `CAR`, `DAY`)의 내부 파일·모크·헬퍼를 직접 import하고 있다. 특히 `SCR_DSH_01`이 5,581줄짜리 `SCR_LED_01` 모듈을 직접 import해 대시보드와 가계부가 강하게 묶여 있다.
- **영향 범위**: `SCR_LED_01` 또는 `CAR`/`ROU` 내부 리팩토링 시 `SCR_DSH_01`·`SCR_SET_01` 빌드 깨짐 위험, 대시보드 독립 번들 분리 불가.
- **관련 의존성 / 미검증 영역**: `BentoLifeServiceCards`의 위젯 요약 계산 로직 분리 방안은 3/4단계 검토 대상.
- **개선 권고안**: `CartoonStackedBookObject`·`getThicknessScale`은 가계부 공유 위젯(`widgets/ledger` 또는 `components/ledger`)으로 추출하고, `QCK` 바텀시트는 `App.tsx`의 전역 빠른 등록(`quickPopupMode`)과 통합하거나 공용 피처로 승격한다. 대시보드·설정이 참조하는 타 도메인 계약(`pluginSettings`, 요약 DTO)은 `shared/contracts`·`services` 포트로 내린다.
- **완료·검증 조건**: `SCR_*.tsx` 상호 import **0건**, `screen/<domainA>` ➔ `screen/<domainB>` 직접 import **0건**. (➔ [WP-04](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-04))

---

### `[FND-07]` `src/App.tsx` 비대 오케스트레이션(970줄)·정적 일괄 번들링 및 거대 모듈 경계 지표
- **우선순위 / 확신도**: **`P2` (보통)** / **확신도: `높음`**
- **근거 (파일·라인)**:
  - `src/App.tsx:12-32`: 21개 전체 화면을 최상위에서 정적 `import` (전체 저장소 동적 `import()` **0건**).
  - `src/App.tsx:60-970`: 라우팅 상태(`currentScreen`), 인증/오프라인/뷰포트 시뮬레이터, 글로벌 스크롤 추적, `CommandPalette`, `ElmQck01`+빠른등록 2종 시트, `GlobalDrawerNav`, 하드코딩 `initialLedgers`(L149-153)까지 단일 컴포넌트(970줄)에 집중.
  - 최상위 비대 파일(500줄 상한 초과 지표): `SCR_LED_01_그룹가계부관리상세.tsx`(5,581줄), `Tokens.tsx`(4,246줄), `SCR_DSH_01_로그인메인대시보드.tsx`(3,564줄), `LadderGameZone.tsx`(3,416줄), `RouletteGameZone.tsx`(1,922줄).
- **현재 동작**: 초기 진입 화면(`SCR-GNT-01`)만 열어도 21개 화면과 5,581줄짜리 가계부·게임 캔버스 코드가 단일 초기 청크로 모두 로드되며, `App.tsx` 내부 상태 변경 시 전체 셸과 자식 트리의 재평가 범위가 넓다.
- **영향 범위**: 초기 번들 크기·TBT(총 차단 시간) 증가, `App.tsx` 상태 소유권 과밀.
- **관련 의존성 / 미검증 영역**: 실제 Vite 프로덕션 청크 크기 측정은 5단계 성능 검토 대상, 4대 거대 파일 내부 분할 설계는 2/4단계 검토 대상.
- **개선 권고안**: `App.tsx`를 `AppShell`(헤더/드로어/시뮬레이터), `ScreenRouter`(`React.lazy` + `Suspense`), `QuickActionHost`로 분리하고, `initialLedgers` 하드코딩을 `RepositoryProvider` 주입으로 이관한다.
- **완료·검증 조건**: `App.tsx` 350줄 이하 슬림화 및 화면별 `React.lazy` 청크 분할 빌드 성공. (➔ [WP-05](./0055-03_작업계획-FSD기반구조_계약단일화_및_DI격리.md#wp-05))

---

## 8. 미검증 영역 및 후속 리뷰 인계

1. **런타임 및 번들 미검증**: 본 1단계 리뷰는 읽기 전용 정적 AST 분석과 소스 열람으로 수행되었으므로, Vite 청크 크기·브라우저 렌더링 프로파일·실제 API/SSE 호출 동작은 검증하지 않았다(5단계 이관).
2. **세부 토큰·도메인 로직·개별 화면 내부**: `Tokens.tsx` 중복/누락(2단계), `useMoaRoutine`/`useMoaCar`/Repository 내부 DTO 불일치(3단계), `SCR_LED_01`·`SCR_DSH_01`·`LadderGameZone` 내부 분할(4단계)은 후속 리뷰 단계로 이관한다.
3. **참고자료 연결**: React 5대 핵심 개념(조합, `props`/`state`, 렌더·커밋, Hooks/`useEffect` 정리, 데이터 흐름)의 코드 연결 학습 자료는 [0055-02](./0055-02_참고자료-React핵심개념과프로젝트적용.md)에 별도 수록했다.

---

## 9. 리뷰 세션 회고 (0055)

- **Keep**: 단순 목측이 아니라 TypeScript AST(`ts.createSourceFile`)로 `src/` 187개 파일 전체의 정적 `import` 그래프와 SCC 순환참조를 추출해 `0건` 순환참조와 `11 + 24 + 3 + 67 + 8 + 3`건의 정확한 계층 경계 위반·고아 8모듈을 빠짐없이 수치로 증명했다. 또한 사용자 리뷰 관점(`server.ts`↔`types.ts` 중복·한글 JSDoc·화면 더미 DI·허니팟 보안 격리)을 즉시 1단계 경계 리뷰와 파생 작업계획(`0055-03`)으로 흡수했다.
- **Problem**: 기존 `[0053-01]`에서 구축된 `useApi`와 모달 5종 상당수가 실제 화면 트리에 연결되지 않은 채 Orphan으로 남아 있었음을 이번 그래프 분석에서 뒤늦게 확인했다.
- **Try**: 차기 구현 세션에서 `WP-01`(공유 계약+한글 JSDoc) ➔ `WP-02`(DI 경계)를 먼저 착지시킨 뒤 `BKL-DATA-01` 백엔드 착수로 넘어가고, 2~5단계 집중 리뷰도 동일한 AST/정량 스냅샷 기준으로 이어간다.
