# [0053-02] 이슈리뷰: IndexedDB 오프라인 동기화 큐, 백엔드 멱등키·LWW 충돌 해결 프로토콜 및 `syncEngine.ts` 연동

> **문서 상태**: 완료 (`COMPLETED`)  
> **태스크 번호**: `[0053-02]` (세션 이슈 `#143`, 2차 우선작업계획 4순위 완결)  
> **작업 일자**: 2026-11-27  
> **작성자**: MoaBogo Core Architecture Team  
> **기준 문서**: `docs/05.계획/261125_2차계획_백엔드착수전_데이터모델링_및_아키텍처정비_로드맵.md`, `docs/04.데이터/init_schema.sql` (`aiagent.offline_sync_queue`)

---

## 1. 구현 범위 및 산출물 요약

### 1.1 IndexedDB 오프라인 큐 영속화 및 LWW 메타 확장 (`src/sample/data/offlineQueueStore.ts`)
- **하이브리드 영속화**: `moabogo_sync_db`(`offline_sync_queue` ObjectStore) IndexedDB와 `localStorage` 동기 미러(`moabogo_offline_queue`)를 결합하고 `hydrateOfflineQueueFromIDB()`·`replaceOfflineQueue()`를 추가했습니다(기존 `useQuickMoneyEntry`, `useQuickDutyGoalEntry`, `SCR_GAM_01` 호출 시그니처 100% 보존).
- **LWW·멱등 메타 확장**: `OfflineQueueItem`에 `operationType`, `entityId`, `clientVersion`, `clientUpdatedAtMs`, `serverVersion`, `serverUpdatedAtMs`, `conflictReason`, `conflictResolution`, `requestUrl`, `requestMethod`, `payload`를 추가하고, `addOfflineQueueItem`에서 `idempotencyKey` 기준 중복 적재를 차단합니다.

### 1.2 백엔드 멱등키 및 LWW 충돌 해결 API (`server.ts`)
- **`GET /api/v1/sync/queue`**: 처리된 멱등키 로그 조회.
- **`POST /api/v1/sync/batch`**:
  - `idempotency_key` 중복 전송 시 재적용 없이 `idempotent_replay: true`로 멱등 응답 반환.
  - `server_version` > `client_version` 충돌 감지 시 `conflict_policy`에 따라 `MANUAL_CONFIRM`(`STALE_CONFLICT` + 서버 버전·사유 반환) 또는 `AUTO_OVERWRITE`(`client_updated_at_ms >= server_updated_at_ms` 기준 자동 LWW 병합) 분기 처리.
  - `LEDGER_EXPENSE` 항목은 `tx-sync-{idempotency_key}` 식별자로 `TRANSACTIONS` 원장에 중복 없이 반영.
- **`POST /api/v1/sync/resolve`**: `'OVERWRITE'`(`MANUAL_OVERWRITE`, 서버 버전 승급) / `'DISCARD'`(`DISCARDED`) 처리.
- `PORT` 환경변수(`Number(process.env.PORT) || 3000`) 지원 추가.

### 1.3 `syncEngine.ts` · `offlineRepository.ts` · 화면 연동
- **`src/services/syncEngine.ts`**:
  - `initSyncEngine()`: `apiClient.registerOfflineMutationHook` 연동으로 오프라인/네트워크 단절 시 발생한 Mutation을 멱등키와 함께 IndexedDB 큐에 자동 보관하며, `window` `'online'` 복구 이벤트 및 `OfflineSyncPreferences.autoSyncIntervalSec`(`0|30|60|300`초) 주기 스케줄러를 구동합니다.
  - `runOfflineSync()` / `resolveSyncConflict()`: `OfflineSyncPreferences.defaultConflictPolicy` 기반으로 `/api/v1/sync/*`를 호출하며, 서버 미연결 시 로컬 폴백(`syncOfflineQueue` / `resolveOfflineConflict`)으로 무중단 동작합니다.
- **`src/services/repositories/offlineRepository.ts`**: `offlineQueueStore`, `offlineSessionStore`, `syncEngine` 통합 Repository 추상화.
- **`src/App.tsx` & `src/sample/screen/SCR_OFF_01_오프라인동기화.tsx`**:
  - `App.tsx` 마운트 시 `initSyncEngine()` 전역 구동.
  - `SCR_OFF_01`: IndexedDB 큐/세션 동시 복원, `offlineRepository.syncNow()` 연동, LWW 충돌 모달 내 **`[로컬 내용으로 덮어쓰기 (LWW)]`** / **`[서버 최신 유지 및 폐기]`** 양방향 선택지 및 버전(`v1 ↔ Srv v2`) 표시 구현.

---

## 2. 검증 결과

| 검증 항목 | 기준 | 검증 결과 |
| :--- | :--- | :---: |
| TypeScript 정적 검사 (`npx.cmd tsc --noEmit`) | 0-Error | **통과 (Exit 0)** |
| Vite 프로덕션 번들 빌드 (`npm.cmd run build`) | 성공 | **통과 (2,110모듈, `4.96s`)** |
| 백엔드 멱등키·LWW API 통합 검증 (`PORT=3099`) | `STALE_CONFLICT`, `idempotent_replay`, `AUTO_OVERWRITE`, `resolve` | **통과** |
| `SCR-OFF-01` CDP 브라우저 통합 검증 | 충돌 모달 노출 및 LWW 덮어쓰기 후 `0건 대기중` | **통과 (오류 0건)** |
