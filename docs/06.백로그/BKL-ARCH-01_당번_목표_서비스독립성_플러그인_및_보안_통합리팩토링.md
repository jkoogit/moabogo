# [BKL-ARCH-01] 모아당번·모아목표 서비스 독립성 확보, 플러그인 전환 및 보안 통합 리팩토링

> **문서 상태**: 계획 (`PLANNED` — 세션 `[0046-01]` 아키텍처 점검에서 도출 및 백로그 등록)  
> **등록 세션**: `[0046]` (`[0046-01]`)  
> **최초 등록일**: 2026-11-23  
> **관련 문서**: `docs/02.아키텍처/05-라이프도메인_서비스독립성_플러그인_및_보안설계서.md`, `docs/02.아키텍처/04-소스코드_및_UIUX_리팩토링_표준지침.md`  
> **대상 화면**: `SCR_DUT_01`, `SCR_DUT_02`, `SCR_GOL_01`, `SCR_GOL_02`, `accountStorePool.ts`, `dutyStore.ts`

---

## 1. 도입 취지 및 배경 (Why)

세션 `[0046-01]` 코드베이스 정밀 점검 결과, 신규 구축된 `모아루틴(SCR_ROU_01)`에는 **2-Layer 독립성 + 플러그인 레지스트리 + 공통 보안 가드레일**이 선도 적용되었으나, 기존 구축 화면인 모아당번·모아목표에는 다음 기술 부채가 확인되었습니다:
1. **파일 비대화(SRP 초과)**: `SCR_DUT_01`(1,064줄), `SCR_DUT_02`(2,012줄), `SCR_GOL_02`(1,398줄)로 단일 파일 유지보수 한계 초과.
2. **화면 간 수평 결합**: `SCR_DUT_02`가 `SCR_DUT_01`에서 유틸 함수(`formatKoreanCycleDays`, `getRotationPolicyLabel`)를 직접 import.
3. **보안·외부 자원 정리 필요**: `dutyStore.ts`의 송금 링크에 `validateSafeTransferUrl` 일괄 적용 필요, 외부 이미지 URL(Unsplash) 로컬/자체 자산 전환 필요, `accountStorePool.ts`의 `localStorage` 저장 시 민감 계좌번호 정제 정책 통일 필요.

---

## 2. 개요 및 요구사항 (Overview & Requirements)

1. **모아당번(`duty/`) 모듈 분해 및 수평 결합 제거**:
   - `src/sample/screen/duty/` 하위로 공통 유틸(`dutyUtils.ts`), 3상태머신 훅(`useMoaDuty.ts`), 3대 뷰 컴포넌트(수행인증 / 대신수행·상계정산 / 실시간통계·랭킹) 분리.
   - `SCR_DUT_02` ➔ `SCR_DUT_01` 수평 import 완전 제거.
2. **모아목표(`goal/`) 유형별 플러그인 전환**:
   - `src/sample/screen/goal/plugins/` 하위로 `GoalMetricPlugin` 도입 (저축형 / 습관형 / 수치달성형 차별 위젯 및 진행률 계산기 분리).
3. **공통 보안 가드레일 전 도메인 확대 적용**:
   - `dutyStore.ts` 및 `SCR_MON_01` 송금 딥링크에 `src/sample/shared/securityGuards.ts`의 `validateSafeTransferUrl` 적용.
   - `accountStorePool.ts` 저장 데이터 마스킹 정책 및 백엔드 전환 대비 `accountId` 참조 일원화.
   - `dutyStore.ts` 내 외부 Unsplash 샘플 이미지 URL을 내부 로컬 자산 또는 SVG 플레이스홀더로 대체.

---

## 3. 기획 및 사용자 시나리오 (User Scenario)

- **개발자 유지보수 시나리오**: 새로운 목표 유형(예: 독서 완독형)이나 당번 순환 정책을 추가할 때 기존 1,000~2,000줄 화면 파일을 건드리지 않고 전용 플러그인 파일 1개만 추가해 안전하게 배포.
- **사용자 보안·안정성 시나리오**: 오프라인·폐쇄망 환경에서도 외부 이미지 깨짐 없이 인증 사진이 렌더링되고, 외부 송금 버튼 클릭 시 검증된 결제 앱/도메인만 실행.

---

## 4. 아키텍처 및 상세 설계 (Technical Architecture)

- `docs/02.아키텍처/05-라이프도메인_서비스독립성_플러그인_및_보안설계서.md`의 2-Layer 경계 규칙 준수.
- 모든 화면 셸 400줄 이하, 개별 플러그인/서브모듈 300줄 이하 달성.
- 외부 Props 인터페이스 100% 보존(Zero-Regression).

---

## 5. 단계별 작업 가이드 (Implementation Guide)

1. **Step 1**: `SCR_DUT_01/02` 공통 헬퍼 추출 (`duty/dutyUtils.ts`) 및 수평 import 제거.
2. **Step 2**: `SCR_DUT_02` 3대 탭 뷰 및 `useMoaDutyDetail` 훅 분리 + `validateSafeTransferUrl` 적용.
3. **Step 3**: `SCR_GOL_01/02` 유형별 플러그인(`goal/plugins/`) 분리.
4. **Step 4**: `dutyStore.ts` 외부 이미지 로컬화 및 `accountStorePool.ts` 민감정보 저장 정제 적용.
5. **Step 5**: `tsc --noEmit` 및 `vite build` 0-Error 회귀 검증.

---

## 6. 검증 절차 및 인수 기준 (Acceptance Criteria)

1. [ ] `SCR_DUT_01`, `SCR_DUT_02`, `SCR_GOL_01`, `SCR_GOL_02` 간 수평 import 0건.
2. [ ] 분리된 모든 `.ts`/`.tsx` 파일이 500줄 이하 SRP 기준 충족.
3. [ ] 모든 외부 송금/초대 링크에 `validateSafeTransferUrl` 검증 통과 적용.
4. [ ] 기존 당번 3상태머신, 상계정산, 목표 달성률, 용돈 이체 인터랙션 100% 무손실 동작.
