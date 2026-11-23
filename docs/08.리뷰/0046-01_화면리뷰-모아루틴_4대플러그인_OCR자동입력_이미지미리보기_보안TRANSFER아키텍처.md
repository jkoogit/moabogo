# [화면리뷰] 모아루틴(SCR_ROU_01) 4대 플러그인·OCR 자동입력·이미지 미리보기 및 보안/TRANSFER 아키텍처 완결

- **문서 ID**: `080046-01`
- **버전**: v1.0
- **작성 일자**: 2026-11-23
- **작성 세션**: `[0046]` (`[0046-01]`)
- **대상 화면**: `SCR_ROU_01` (모아루틴 허브), `SCR_DAY_01` (모아데이 슬라이드드래그휠 연계 보정), `ElmBsh01` (이동형 바텀시트)
- **추적 이슈**: GitHub Issue [#121](https://github.com/jkoogit/moabogo/issues/121)
- **검토 승인자**: MoaBogo Core Product & Frontend Architecture Team

---

## 📌 1. 개요 및 작업 목적

본 리뷰 문서는 **모아루틴(`SCR_ROU_01`)**의 4대 생활·재무 루틴(약복용, 알뜰폰 환승, 세금계산서 발급, 급여·카드 정산)을 **서비스 독립성 플러그인 레지스트리(Strategy Registry)** 아키텍처로 구축하고, 실제 증빙 이미지(카드명세서·약봉지·세금계산서·번호이동 캡처) 기반 **멀티 파일첨부 OCR 자동입력, 원터치 확인 상태머신, 인라인/크기조절 팝업 이미지 미리보기, 공통 보안 가드레일 및 가계부 자산이동(`TRANSFER`) 단방향 브릿지**를 완결한 코드리뷰 결과를 기록합니다.

---

## 🛠️ 2. 주요 구현 및 고도화 상세 내역

| 영역 | 대상 모듈 / 문서 | 핵심 구현 및 리뷰 검증 내역 |
| :--- | :--- | :--- |
| **서비스 독립성 & 플러그인 레지스트리** | `src/sample/screen/routine/plugins/pluginContract.tsx`<br>`src/sample/screen/routine/plugins/registry.ts`<br>`docs/02.아키텍처/05-라이프도메인_서비스독립성_플러그인_및_보안설계서.md` | • 4대 루틴을 `RoutinePlugin<T>` 표준 계약 및 Feature Flag(`enabled`) 기반 전략 레지스트리로 분리하여 도메인 간 수평 import 0건 달성<br>• `SCR_ROU_01_모아루틴.tsx`, `RoutineCards.tsx`, `RoutineModals.tsx`는 레지스트리 위임 셸로 슬림화(SRP 준수)<br>• 당번·목표 도메인 동일 리팩토링 백로그(`BKL-ARCH-01`) 및 자동차 독립 도메인(`BKL-CAR-01`) 분기 문서화 완료 |
| **보안 가드레일 & 가계부 TRANSFER 브릿지** | `src/sample/shared/securityGuards.ts`<br>`src/sample/shared/ledgerTransferBridge.ts` | • 계좌번호·사업자등록번호·휴대전화번호·실물 USIM 일련번호(`maskUsimSerial`) 자동 비식별화 및 `sanitizeForLocalStorage` 저장 전 정제 강제<br>• 토스 송금 딥링크 화이트리스트 검증(`buildSafeTossTransferUrl`, 허용 프로토콜 `supertoss:`, `kakaopay:`, `https:`)<br>• 단방향 `publishLedgerTransfer` 포트 구축 (`isAssetTransfer: true`, 1:1 자기참조 페어링, FNV-1a 결정적 멱등키 중복 차단) |
| **공통 OCR 자동입력 · 터치확인 · 이미지 미리보기** | `src/sample/shared/routineOcrFields.tsx`<br>`src/sample/shared/OcrImagePreviewer.tsx`<br>`docs/03.디자인/02-UI디자인정책-이미지.md` (§2.3, §2.4, §5.1) | • `OcrConfirmBadge` 3상태머신 구현: **`자동입력`**(`AUTO_UNCONFIRMED`) ↔ **`확인됨`**(`CONFIRMED`, 원터치) / **`수정·확인됨`**(`EDITED`, 직접 수정 시 자동 승격)<br>• 멀티 파일첨부 바(`RoutineAttachmentDropBar`): `ElmSld03` 첨부 칩, `자동입력 확인 N/M`, `[전체 확인]`, 기존 내용 보존형 추가(Append)<br>• **OCR 이미지 미리보기 2단계 뷰어**: 칩 내 `미리보기` 아이콘(`Eye`) 클릭 시 인라인 확대/축소(`50%~400%`)·드래그 팬 펼침 + **`[큰 팝업]`** 클릭 시 크기조절(리사이즈 핸들 + `S/M/L/최대`)·헤더 이동·다중 전환 Portal 팝업 지원 |
| **약복용 플러그인 (약봉지 OCR)** | `src/sample/screen/routine/plugins/medicinePlugin.tsx` | • 실제 약봉지(구의베스트내과/산들약국 5종 약품 · 14일분 · 수납 32,300원) 기반 1회 투약량×1일 횟수(1~4회)×일수 자동 산정 및 `아침·점심·저녁·취침전` 시점 자동 매핑<br>• 시점 복용 체크 시 해당 시점 약품별 잔여량 동시 차감/복구, 효능·보관법·주의사항 태그 표시<br>• **`[+ 약품 추가]`** 버튼을 약품 목록 하단(풀폭 점선 버튼)으로 배치하여 추가 직후 자연스러운 작성 동선 확보 |
| **급여·카드 정산 플러그인 (명세서 OCR)** | `src/sample/screen/routine/plugins/cardSettlePlugin.tsx` | • 실제 카드대금 정산표(`카드대금.2611.13`: 6대 카드사 + `국민.보험`·`우리.청약+IRP` 고정정산) 기반 `결제금액 / 상환금액 / 남은결제금액` 자동 계산<br>• **`[카드·고정 항목별]` ↔ `[결제은행별 합산]`** 분리 뷰 토글, 은행별/카드별 **`[토스 송금]`** · **`[카톡 복사]`** 및 **`[가계부 TRANSFER 자동 기장]`** 원스톱 연동 |
| **세금계산서 플러그인 (영수증 OCR)** | `src/sample/screen/routine/plugins/taxInvoicePlugin.tsx` | • 홈택스 전자세금계산서 영수증 첨부 시 공급받는자 상호·사업자번호(자동 마스킹)·대표자·이메일·작성일자·품목·공급가액·부가세(10% 자동산정)·`청구/영수` 구분 자동 입력 및 개별 터치확인·발급 토글 지원 |
| **알뜰폰 환승 플러그인 (4단계 캡처 OCR)** | `src/sample/screen/routine/plugins/mvnoPlugin.tsx` | • 5단계 D-Day FSM, 90일 번호이동 제한 해제일 자동 산정, 실물 USIM 일련번호 마스킹 입력 및 4단계(요금제·신청동의·유심/eSIM·개통완료) 화면 캡처 OCR 수집·터치확인 구현 |
| **공통 UI/UX 정책 & 토큰 고도화** | `src/sample/elements/Tokens.tsx` (`ElmBsh01`)<br>`src/sample/screen/SCR_DAY_01_모아데이.tsx`<br>`docs/03.디자인/04-공통요소정의서.md` | • `ElmBsh01` 상단 드래그 핸들 자유 위치 이동(뷰포트 12px 클램핑, 플로팅 `rounded-2xl`, 더블클릭 원위치 복귀) 적용<br>• `SCR_ROU_01` 필터 바, `RoutineCreateModal` 유형 선택, `SCR_DAY_01` 3대 영역에 타이틀/컨텐츠 DIV 분리(§2.3) 및 `ElmSld03` 슬라이드드래그휠 적용 |

---

## 🏛️ 3. 아키텍처 · 보안 · 금전관리 원칙 점검 결과

1. **금전관리 3대 원칙 준수**:
   - 급여계좌 ➔ 카드사/고정정산 결제계좌 이체는 `ledgerTransferBridge.publishLedgerTransfer`를 통해 `isAssetTransfer: true` 및 1:1 자기참조 페어링(`transferId` ↔ `relatedTransferId`)으로 기장되어 순수 생활비 지출 이중계상을 원천 차단함.
2. **PII 보안 및 외부 링크 화이트리스트**:
   - 로컬 스토리지 영속화 직전 `sanitizeForLocalStorage`가 계좌번호(`accountNo`), 사업자번호(`bizNo`), 전화번호(`phoneNumber`), 유심번호(`usimSerial`) 키를 일괄 마스킹함.
   - `window.alert` / `window.open` 미사용; 안전 딥링크 검증(`buildSafeTossTransferUrl`) 및 클립보드 복사 + `ElmToast01` 피드백 패턴 적용.
3. **컴포넌트 모듈화 및 디자인 정책 준수**:
   - `OcrImagePreviewer.tsx`를 별도 공유 모듈로 분리하고, 모든 입력/필터/목록 블록에 타이틀 DIV / 컨텐츠 DIV 분리(§2.3), `whitespace-nowrap`, `tabular-nums`, `e.stopPropagation()` 적용 완료.

---

## 🧪 4. 정적 타입 및 컴파일 검증 결과

- `tsc --noEmit` (TypeScript 정적 린트): **0-Error 통과**
- `npm run build` (Vite 프로덕션 번들링): **0-Error 통과**

---

## 🚀 5. 결론 및 승급 판정

`[0046-01]` 모아루틴 4대 플러그인 아키텍처, 실전 증빙 기반 OCR 자동입력·원터치 확인·이미지 미리보기(인라인 + 크기조절 팝업), 보안 가드레일 및 가계부 `TRANSFER` 단방향 브릿지 구현이 모두 0-Error로 검증 완료되었습니다. `dev` 브랜치 PR 머지 및 `stg`/`main` 배포 승급을 진행합니다.
