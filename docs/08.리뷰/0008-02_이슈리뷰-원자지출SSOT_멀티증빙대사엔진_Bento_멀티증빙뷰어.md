# [이슈리뷰 0008-02] 전역 원자 지출(SSOT)·멀티 증빙 대사 엔진 및 SCR-LED-01 명세서 Bento·멀티증빙뷰어 구현 리뷰

## 1. 개요 및 목적
- **이슈 식별자**: [0008_02]
- **작업 범위**:
  1. **전역 원자 지출 불변 원장 (Atomic Expense SSOT) 및 대사 수렴 엔진**:
     - 시스템 전역에 유일한 금융 결제 사건 단일성 보장.
     - 카드 이용대금명세서를 100% 신뢰도의 골든 소스(Golden Source of Truth)로 삼아 영수증/알림톡과 대사 수렴(`reconciliation_status`: `PENDING` ➔ `CONFIRMED`).
     - 장부에서 제거되어도 `UNALLOCATED` 상태로 격리되며, 설정된 수명주기(기본 90일 TTL) 후 백그라운드 가비지 컬렉션(GC) 자동 정리.
  2. **운영비 0원 온디맨드 스토리지 계층화 (Zero-Cost Storage Tiering)**:
     - 30일 경과 증빙은 월별 tarball(`proofs_YYYY_MM.tar.gz`)로 압축 보관 (92% 디스크 절감).
     - 사용자 확대 조회 시에만 임시 메모리 스트림 단건 해제.
     - **스트림 파기 운영정책 옵션 (`stream_cache_purge_policy`)**: 0초 즉시 파기(OOM 2GB 방어), 1일 임시 보관, 1달 보관 설정.
  3. **SCR-LED-01 서브 뷰 토글 및 10월 6대 카드사 명세서 Bento 그리드**:
     - 원장 거래 목록 (`LEDGER`) vs 10월 카드명세서 분석 (`STATEMENT_BENTO`) 듀얼 탭.
     - 총 청구액 ₩6,029,542, 11월 도래 할부 완납(건강보험 20.4만 + 치과 40만) 총 ₩604,083원 세이빙 경보.
     - KB국민 리볼빙(연 14.1%) 100% 결제 설정 방어 및 수수료 ₩11,040 분석.
     - 고정비 ₩1,933,767 (32.1%) 분해 레이더 및 6대 카드사별 세부 아코디언 피드.
  4. **N개 멀티 증빙 인스펙터 모달 (Multi-Proof Inspector)**:
     - 단일 원자 지출에 매핑된 수기, OCR 영수증, 알림톡, 카드명세서 체인 시각화.
     - 온디맨드 원본 스트림 압축 해제 및 파기 정책 옵션 선택 체험.

---

## 2. 변경 파일 및 산출물 내역

| 구분 | 파일 경로 | 주요 변경 내용 |
| :--- | :--- | :--- |
| **기획(PRD)** | `docs/01.프로젝트/01-prd-spec.md` | **UC-06 신설**: 원자 지출 SSOT, 90일 미아데이터 TTL/GC, N개 멀티 증빙 체인, 무비용 스토리지 티어링 |
| **아키텍처** | `docs/02.아키텍처/01-architecture-spec.md` | **Section 6 & 7 신설**: 불변 원자 지출 SSOT, 대사 엔진, tarball 온디맨드 해제 및 파기 운영정책 옵션 |
| **데이터** | `docs/04.데이터/01.데이터설계.md` | **4.12 `atomic_expenses`**, **4.13 `expense_proofs`**, **4.14 `retention_policies`** 스키마 및 복합 인덱스 3종 추가 |
| **화면(UI)** | `src/sample/screen/SCR_LED_01_그룹가계부관리상세.tsx` | - 10월 카드명세서 분석 Bento 대시보드 (`STATEMENT_BENTO`)<br>- 거래 내역 내 명세서 대사 뱃지 및 증빙 체인 버튼<br>- N개 멀티 증빙 인스펙터 모달 (`selectedTxForProofs`)<br>- 고해상도 메모리 스트림 파기 운영정책 옵션(즉시/1일/1달) 선택 UI |
| **리뷰** | `docs/08.리뷰/0008-02_이슈리뷰-원자지출SSOT_멀티증빙대사엔진_Bento_멀티증빙뷰어.md` | 본 리뷰 문서 발행 |

---

## 3. 정적 검증 결과

1. **`lint_applet`**: `tsc --noEmit` 0-Error 통과 (AlertTriangle 중복 import 정리 및 타입 무결성 보장)
2. **`compile_applet`**: Vite 빌드 정상 완료 (무결성 검증 완료)

---

## 4. 후속 조치 계획
- 본 기능 브랜치(`feature/0008_02_atomic_expense_multi_proof_bento`)를 원격 저장소에 푸시하고, GitHub API를 통해 `dev` 브랜치에 PR 생성 및 머지 수행.
- 머지 완료 후 `stg` 및 `main` 브랜치로의 승급 머지(`POST /repos/:owner/:repo/merges`) 준비.
