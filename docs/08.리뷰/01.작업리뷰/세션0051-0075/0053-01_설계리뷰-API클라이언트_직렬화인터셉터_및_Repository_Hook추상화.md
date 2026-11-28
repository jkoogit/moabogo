# [0053-01] 설계·구현 리뷰: 서비스 API 클라이언트(apiClient.ts), 케이스 변환 인터셉터 및 Repository/Hook 추상화 계층 구축

> **문서 상태**: 완료 (`COMPLETED`)  
> **태스크 번호**: `[0053-01]` (세션 이슈 `#143`, 2차 우선작업계획 4순위)  
> **작업 일자**: 2026-11-27  
> **작성자**: MoaBogo Core Architecture Team  
> **기준 문서**: `docs/05.계획/261125_2차계획_백엔드착수전_데이터모델링_및_아키텍처정비_로드맵.md`

---

## 1. 아키텍처 개선 및 산출물 요약

### 1.1 직렬화/역직렬화 인터셉터 및 표준 HTTP 클라이언트 (`src/services/`)
1. **`src/services/caseTransform.ts`**:
   - Request 시 `camelCase` ➔ `snake_case`(`toSnakeCase`), Response 시 `snake_case` ➔ `camelCase`(`toCamelCase`)를 재귀적으로 변환하며 `FormData`·`File`·`Blob` 등 비일반 객체와 `undefined` 필드를 안전하게 보존/제외합니다.
2. **`src/services/apiClient.ts`**:
   - **요청 인터셉터**: `X-Client-Platform: WEB_APP`, 오프라인 세션(`getCachedOfflineSession`) 기반 `Authorization` / `X-User-Id` 헤더, 선택적 `X-Idempotency-Key` 자동 주입.
   - **타임아웃 & 취소**: `AbortController` 기반 기본 15초 타임아웃(Cloudflare 524 방어) 및 호출자 `signal` 합성 취소.
   - **응답/오류 규격화**: `ApiError` 클래스로 `409 Conflict`(`isConflict`), `504/524`(`isTimeout`), 네트워크 단절(`isNetworkError`)을 일관 분류.
   - **오프라인 확장 포트**: `registerOfflineMutationHook`으로 차기 태스크 `[0053-02]`의 `syncEngine.ts` IndexedDB 큐 자동 위임을 무결하게 연계할 수 있습니다.

### 1.2 도메인 Repository 및 공용 React Hook 계층
1. **Repository 레이어 (`src/services/repositories/`)**:
   - `repositoryContract.ts`: `DataSourceMode` 및 `shouldUseOfflineFallback` 공통 판별 헬퍼(`409` 비즈니스 충돌은 폴백 제외).
   - `ledgerRepository.ts`: 가계부·거래내역 CRUD(`listLedgers`, `createLedger`, `listTransactions`, `createTransaction`, `deleteTransaction`) 및 레거시 `src/types.ts` 호환 매퍼(`toLegacyLedger`, `toLegacyTransaction`).
   - `financeRepository.ts`: 모임 정산(`events`), 2단계 OCR 파이프라인(`ocr/upload`, `ocr/tasks/:taskId`), 개인 OCR 키(`user/ocr-key`), 당번/용돈/빌림 조회 API 추상화.
   - `preferencesRepository.ts`: `servicePreferencesPool`, `accountStorePool`, `systemGovernancePool`을 캡슐화한 통합 설정 Repository.
2. **React Hook 레이어 (`src/hooks/useApi.ts`)**:
   - `useApiQuery` / `useApiMutation`으로 로딩·에러·재조회 상태와 언마운트 시 `AbortController` 자동 취소를 표준화했습니다.

### 1.3 컴포넌트 Raw `fetch` 제거 (모달 5종 전환)
- `TransactionModal.tsx`, `NewLedgerModal.tsx`, `EventModal.tsx`, `OCRScannerModal.tsx`, `SettingsModal.tsx`에서 직접 `fetch('/api/v1/...')` 호출을 전면 제거하고 `ledgerRepository` / `financeRepository`로 일원화했습니다(`buildIdempotencyKey` 기반 `X-Idempotency-Key` 및 `409` 중복 경고 유지, `OCRScannerModal` 언마운트 타이머 정리 보강).

---

## 2. 검증 결과

| 검증 항목 | 기준 | 검증 결과 |
| :--- | :--- | :---: |
| `caseTransform` 왕복 & 라이브 API 변환 | `toSnakeCase` ↔ `toCamelCase` 및 `/api/v1/ledgers` | **통과 (`count=3`)** |
| 모달 5종 내 직접 `fetch(` 잔존 | 0건 | **통과 (0건)** |
| TypeScript 정적 검사 (`npx.cmd tsc --noEmit`) | 0-Error | **통과 (Exit 0)** |
| Vite 프로덕션 번들 빌드 (`npm.cmd run build`) | 성공 | **통과 (2,108모듈, `5.54s`)** |
