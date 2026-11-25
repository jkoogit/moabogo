# [0051-01] 설계리뷰: 모아부릉 및 전 서비스 사용자관리(SCR-SET-01)·시스템운영관리(SCR-SYS-01) 보완 기획·설계·화면설계서

> **문서 상태**: 완료 (`COMPLETED`)  
> **태스크 번호**: `[0051-01]` (세션 이슈 `#137`)  
> **작업 일자**: 2026-11-26  
> **작성자**: AI Engineer (antigravity / Gemini 4 Hydrogen)  
> **주요 산출물**:  
> - `docs/01.프로젝트/04-전서비스_사용자관리_시스템운영관리_보완_기획_설계_화면설계서.md` (`010004`, v1.0 신설)  
> - `docs/03.디자인/03-화면목록정의서.md` (`030003` 현행화)  
> - `docs/04.데이터/02-화면_DB_1대1_대사검증서.md` (`040003` 현행화)  
> - `docs/README-docs.md` (`000000` 현행화)

---

## 1. 개요 및 목적 (Overview & Goals)

본 문서는 `2차 우선작업계획` 2순위(`[0051]`)의 첫 번째 태스크(`[0051-01]`)로 수행된 **모아부릉(`CAR`) 및 전 서비스(`DAY`·`ROU`·`OFF`·`MYP`·`LED`·21개 전체 구현 화면 RBAC)** 대상 **사용자 맞춤 환경설정(`SCR-SET-01`)** 및 **시스템 운영관리 백오피스(`SCR-SYS-01`)** 보완 기획·설계·화면설계서 수립 결과를 리뷰합니다.

---

## 2. 핵심 설계 및 검토 결과 (Key Deliverables)

### 2.1 `SCR-SET-01` 사용자관리 보완 설계 (10탭 ➔ 12탭 통합)
1. **모아부릉(`CAR` 탭) & `car_widget` 대시보드 편입**:
   - 기존 로컬 `useState`에 머물던 모아부릉 설정을 `vehicles`·`vehicle_maintenance_rules`·`user_service_preferences('CAR')`에 대응하는 SSOT 구조로 승격하고, 다중 차량 CRUD·대표차량(`is_primary`)·공유가계부(`shared_ledger_id`)·번호판 PII 마스킹(`privacy_mask_plate_number`)·3-Key 중복 자동대사(`auto_reconcile_duplicates`)·6종 소모품 기본 주기를 설계했습니다.
   - `dashboardConfigPool.ts`에 `car_widget`을 편입하여 11개 ➔ **12개 위젯 모듈** 및 4대 추천 프리셋 재정렬 규격을 확정했습니다.
2. **모아데이(`DAY`)·모아루틴(`ROUTINE`)·오프라인(`OFFLINE`)·공통(`LAYOUT`/`NOTIFY`) 통합**:
   - `SCR-DAY-01` 모달에만 격리되어 있던 `moabogo_day_settings_v2`(`DisplaySettings`)를 `SCR-SET-01` `DAY` 탭과 양방향 SSOT 연동하도록 설계했습니다.
   - `OFFLINE` 탭을 신설하여 자동 동기화 주기, LWW 충돌 기본 정책(`MANUAL_CONFIRM` / `AUTO_OVERWRITE`), IndexedDB `OfflineAuthSession` 조회 및 즉시 폐기 UI를 명세했습니다.
   - 가계부 기본 귀속/지출 카테고리 순서, 마이페이지 퀵복사·프로필 공개 범위, 7대 서비스 개인 알림 토글을 `LAYOUT`·`NOTIFY` 탭에 통합 설계했습니다.

### 2.2 `SCR-SYS-01` 시스템운영관리 보완 설계
1. **21개 전체 구현 화면 RBAC 전수 현행화**:
   - `src/App.tsx`의 실제 구현 기준 21개 화면(`SCR-GNT-01`, `SCR-AUT-01/02`, `SCR-DSH-01`, `SCR-LED-01`, `SCR-DAY-01`, `SCR-ROU-01`, `SCR-CAR-01`, `SCR-DUT-01/02`, `SCR-GOL-01/02`, `SCR-MON-01`, `SCR-GAM-01`, `SCR-QCK-01/02`, `SCR-MYP-01`, `SCR-SET-01`, `SCR-OFF-01`, `SCR-SYS-01`, `SCR-SMP-01`)을 `DEFAULT_SCREENS`·`DEFAULT_MENUS`·`DEFAULT_ROLE_GROUPS`에 전수 매핑하고, 기저장 `localStorage`용 안전 병합 마이그레이션(`mergeMissingDefaults`)을 설계했습니다.
2. **마스터코드 28종 · 알림매트릭스 22종 · `retention_policies` 수명주기 관제**:
   - `init_schema.sql` 시드와 1:1 정합성을 맞추어 `CAR_FUEL_TYPE`, `CAR_LOG_TYPE`, `CAR_MAINTENANCE_TYPE`, `CAR_INSURANCE_CO`, `CAR_INSPECT_CAT`, `ROUTINE_CATEGORY`, `MVNO_NETWORK`, `DAY_SOURCE_TYPE` 8종을 추가(20종 ➔ **28종**)했습니다.
   - `SystemNotificationMatrix`를 13종 ➔ **22종**(`CAR` 3·`DAY` 2·`ROU` 4 추가)으로 확장하고, `INFRA` 탭 내 `retention_policies`(미아데이터 TTL 90일, tarball 30일, 자동 GC, 스트림 캐시) 관제 패널을 설계했습니다.

### 2.3 아키텍처 충돌 방지 (`[0051-02]` vs `[0052] BKL-ARCH-01`)
- 기존 거대 파일(`SCR_SET_01` 5,912줄, `SCR_SYS_01` 5,513줄)의 전면 분해는 `[0052]`(`BKL-ARCH-01`)로 유지하되, `[0051-02]` 신규 구현분은 `servicePreferencesPool.ts` 및 `settings/`·`system/` 하위 독립 패널로 모듈 분리하도록 청사진을 확정했습니다.

---

## 3. 정적 검증 및 연계 문서 정합성 확인

- **문서 정합성**: `docs/03.디자인/03-화면목록정의서.md`, `docs/04.데이터/02-화면_DB_1대1_대사검증서.md`, `docs/README-docs.md`와 1:1 대사 및 작업이력 현행화 완료.
- **소스코드 무결성**: 본 태스크는 문서 수립 전용으로 `src/` 변경 없이 `npx.cmd tsc --noEmit` 및 `npm.cmd run build` 0-Error 상태를 유지함을 확인했습니다.
