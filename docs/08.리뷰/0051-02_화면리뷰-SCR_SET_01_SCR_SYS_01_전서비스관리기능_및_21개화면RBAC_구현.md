# [0051-02] 화면리뷰: SCR-SET-01 & SCR-SYS-01 전 서비스 관리기능 보완 및 21개 화면 RBAC 구현

> **문서 상태**: 완료 (`COMPLETED`)  
> **태스크 번호**: `[0051-02]` (세션 이슈 `#137`)  
> **작업 일자**: 2026-11-26  
> **작성자**: AI Engineer (antigravity / Gemini 4 Hydrogen)  
> **기준 설계서**: `docs/01.프로젝트/04-전서비스_사용자관리_시스템운영관리_보완_기획_설계_화면설계서.md` (`010004`)

---

## 1. 구현 범위 및 산출물 요약

### 1.1 신규 SSOT 데이터 풀 및 도메인 실시간 동기화
1. **`src/sample/data/servicePreferencesPool.ts` (신규)**:
   - 모아부릉(`CarPreferencesState`: 다중 차량·번호판 PII 마스킹 `maskPlateNumber`·3-Key 자동대사·6종 소모품 기본 주기 `DEFAULT_CAR_MAINTENANCE_PRESETS`), 모아데이(`loadDayDisplaySettings`/`saveDayDisplaySettings`), 모아루틴 확장(`RoutineExtendedPreferences`), 오프라인 동기화 정책(`OfflineSyncPreferences`), 전 서비스 공통(`CommonServicePreferences`)을 `localStorage` + `CustomEvent` SSOT로 통합했습니다.
2. **`src/sample/data/dashboardConfigPool.ts`**:
   - `DashboardModuleId`에 `'car_widget'`을 추가(11➔12모듈)하고 4대 추천 프리셋(`DEFAULT`, `FINANCE_FIRST`, `LIFE_FIRST`, `QUICK_GAME`) 배치 및 기존 사용자 병합 로드를 검증했습니다.
3. **`src/sample/data/systemGovernancePool.ts`**:
   - `DEFAULT_MENUS`(16종)·`DEFAULT_SCREENS`(8개➔**21개 전체 구현 화면**)·`DEFAULT_ROLE_GROUPS` RBAC 매핑을 전수 현행화하고, 구버전 `localStorage`에서도 누락 항목이 안전 병합되도록 `mergeMissingDefaults`를 도입했습니다.
   - `MASTER_GROUP_CODES`를 20종➔**28종**(`DAY_SOURCE_TYPE`, `ROUTINE_CATEGORY`, `MVNO_NETWORK`, `CAR_FUEL_TYPE`, `CAR_LOG_TYPE`, `CAR_MAINTENANCE_TYPE`, `CAR_INSURANCE_CO`, `CAR_INSPECT_CAT`)으로 확장하고 상세 코드 시드를 반영했습니다.
   - `SystemNotificationMatrix`를 13종➔**22종**(`CAR` 3·`DAY` 2·`ROU` 4 추가)으로 확장하고 `SystemRetentionPolicy`(`retention_policies` 대응)를 신설했습니다.
4. **`useMoaCar.ts`, `SCR_CAR_01_모아부릉.tsx`, `useMoaDayCalendar.ts`**:
   - `SCR-SET-01`에서 변경한 차량·번호판 마스킹·모아데이 표시 설정이 `SCR-CAR-01` 및 `SCR-DAY-01`에 즉시 반영되도록 양방향 이벤트 리스너를 연동했습니다.

### 1.2 `SCR-SET-01` (12탭 개편) & `SCR-DSH-01` (`CarBentoCard`)
- **`src/sample/screen/settings/` 서브패널 모듈화 (4종)**:
  - `CarSettingsPanel.tsx`: 다중 차량 CRUD·대표차량 지정·활성 토글·공유 가계부 매핑, 번호판 마스킹·자동대사 토글, 6종 소모품 교체 주기 프리셋, 모아데이 투영 대상, 중복지출 정리센터 연결
  - `DaySettingsPanel.tsx`: `moabogo_day_settings_v2` 양방향 연동(과거의 오늘 0~5년, PWA 수집 3종, Level 1·2 캘린더 투영)
  - `OfflineSettingsPanel.tsx`: 자동 동기화 주기, LWW 충돌 정책, 대기/충돌 큐 카운트 및 IndexedDB `OfflineAuthSession` 조회·즉시 폐기
  - `CommonServicePanel.tsx`: 기본 귀속 가계부·지출 카테고리 노출 순서, 마이페이지 대표계좌 퀵복사·프로필 공개 범위 설정
- **`SCR_SET_01_사용자설정.tsx`**: `DAY`·`OFFLINE` 탭 신설(10탭➔12탭), `ROUTINE` 세부 기본값(브리핑 시각·스트릭 유예·알뜰폰 정원·세금계산서 마감), `NOTIFY` 7대 서비스 개인 알림 연동.
- **`BentoLifeServiceCards.tsx` & `SCR_DSH_01_로그인메인대시보드.tsx`**: `CarBentoCard`를 추가하고 `isEnabled('car_widget')`로 대시보드 벤토 그리드에 통합했습니다.

### 1.3 `SCR-SYS-01` (수명주기·22종 알림·28대 코드·21개 RBAC)
- **`src/sample/screen/system/RetentionPolicyPanel.tsx` (신규)**: 미아데이터 TTL(90일), tarball 압축 전환(30일), 자동 GC, 스트림 캐시 정책(`INSTANT`/`1_DAY`/`30_DAYS`) 관제 UI 구현.
- **`SCR_SYS_01_시스템운영관리.tsx`**: `INFRA` 탭 내 `RetentionPolicyPanel` 통합, `NOTIFY` 탭 22종 알림 매트릭스 UI 확장, `MASTER_CODE` 탭 9대 카테고리(`모아데이`·`모아루틴`·`모아부릉` 포함, 28종) 필터 현행화.

---

## 2. 아키텍처·품질 및 정적 빌드 검증 결과

- **모듈 분할(SRP) 준수**: 신규 추가 UI를 `settings/`·`system/` 서브패널과 `servicePreferencesPool.ts`로 분리하여 `[0052]`(`BKL-ARCH-01`) 기존 탭 분해 작업과 충돌 없이 확장했습니다.
- **정적 타입 검증 및 프로덕션 빌드**:
  ```bash
  npx.cmd tsc --noEmit  # Exit Code 0 (0-Error)
  npm.cmd run build     # vite v6.4.4, 2059 modules transformed, ✓ built in 5.05s (Exit Code 0)
  ```
