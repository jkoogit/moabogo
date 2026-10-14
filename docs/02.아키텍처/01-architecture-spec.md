# 02-architecture-spec.md : 시스템 아키텍처 및 리소스/트랜잭션 가드레일

## 1. 인프라 구성 (Single Ubuntu Laptop Node)
- **OS**: Ubuntu Linux
- **Database**: PostgreSQL 16
- **OCR Engine**: Docker EasyOCR Container
- **Network Tunnel**: Cloudflare Tunnel (`moabogo.com` 외부 포트오픈 없이 SSL 터널링)

---

## 2. 리소스 관리 & OOM 방지 아키텍처

```text
[Cloudflare Tunnel] ---> [Node.js / Spring API] ---(Semaphore 1~2)---> [Docker EasyOCR]
                                │                                 (Memory: 2G / CPU: 2.0)
                                ▼
                       [PostgreSQL 16]
                       (Max Conn: 30 / HikariCP)
```

- **Docker OCR 리소스 제한**:
  - `--memory="2g" --cpus="2.0"` 설정 강제. (PostgreSQL 프로세스 OOM Killer 방지)
  - 환경변수 `OMP_NUM_THREADS=2`, `OPENBLAS_NUM_THREADS=2` 고정.
- **PostgreSQL 커넥션 및 메모리**:
  - `max_connections = 30`, HikariCP 커넥션 풀 유지.
- **OCR 동시성 제어 (Semaphore)**:
  - 백엔드단에서 OCR 동시 요청 수 1~2건으로 제한. 초과 요청은 `ocr_task` DB 큐에 수신 후 순차 처리.
- **RAM 디스크 (`tmpfs`)**:
  - 업로드된 이미지 및 임시 파일은 `/tmp` (tmpfs)에 할당하여 SSD I/O 병목 및 수명 방지.

---

## 3. 비동기 Task 멱등성 & 정합성 보장 방안

### 3.1 `ocr_task` DB 상태 머신
- `PENDING` -> `PROCESSING` -> `COMPLETED` / `FAILED` / `STALE`

### 3.2 멱등성 (Idempotency) 규칙
- **SHA-256 이미지 해시 중복 차단**: 동일 이미지 재업로드 시 해시값 비교 후 기존 Task 결과 즉시 반환.
- **Task ID 즉시 반환**: Cloudflare 524 타임아웃 방지를 위해 업로드 즉시 `task_id` 반환 후 비동기 파싱.

### 3.3 보상 프로세스 (Compensating Transaction)
- **Stuck Task 자동 복구**: `PROCESSING` 상태로 3분 이상 정체 시 `retry_count` +1 후 재시도 (최대 3회).
- **3회 초과 실패 시**: `FAILED` 처리 후 1차 OCR 결과 기반 수동 보정 모달로 유연하게 Fallback.

---

## 4. 프론트엔드 적응형 벤토 엔진 & 상태 영속화 (Adaptive Bento Architecture)

### 4.2 대시보드 11대 UX 고도화 및 내비게이션 복구 아키텍처
- **장부관리 화면 복구 내비게이션 (`onBack` 콜백)**: 대시보드에서 `SCR_LED_01_그룹가계부관리상세`로 드릴다운 이동 시, 상단 복구 버튼(`<`)을 통해 단일 액션으로 대시보드 홈 상태로 100% 무손실 복귀.
- **가계부 책꽂이 듀얼 뷰어 (그리드 vs 리스트)**: 시각적 카드 뷰와 밀도 높은 행(Row) 리스트 뷰를 아이콘으로 상호 전환. 가계부 추가 카드는 홀수 슬롯 잔여 시에만 조건부 배치하여 여백 최적화.
- **요청된 머니 (Inbound Money) 웜 톤 & 송금 딥링크 마감**: 적색 경고톤을 배제하고 따뜻한 웜 앰버 골드 테마 적용. 승인 후 토스/카카오페이 딥링크 및 계좌번호 복사 안내 모달로 마감.
- **서비스 전체 통합 활동이력 타임라인 (Recent Activity Feed & Dual Viewer)**: 분산된 이벤트를 단일 타임라인 피드로 통합하여 가계부 기장, 머니 요청, 당번 인증, 목표 달성 내역을 일목요연하게 스트리밍. 카드 뷰(Card)와 목록 뷰(List) 듀얼 보기 모드, 최근 건수(5/10/20건) 필터링, 5줄 초과 시 세로 스크롤 및 페이지네이션 연동 지원.
- **게스트홈 정산 프리셋 flex-wrap & 버튼명 직관화**: 가로 스크롤을 배제한 반응형 칩 배열과 '목표 재배치', '사다리 재배치' 직관적 네이밍 아키텍처.
- **로그인 사용자 전용 게임 프리셋 아키텍처**: 자주 쓰는 인원(4인 가족, 팀 회식)과 벌칙 설정을 영속화된 프리셋으로 관리하고, 원클릭 즉시 플레이 지원.

---

## 5. 회계 트랜잭션 엔진 & 장부 생명주기 아키텍처

### 5.1 TRANSFER 1:1 자기참조 페어링 엔진 (Zero-Imbalance Protocol)
- **트랜잭션 원자성**: `transactions.is_asset_transfer = true`인 거래는 반드시 쌍(Pair)으로 생성되며, `related_transfer_id`로 상호 바인딩.
- **수정/삭제 멱등 전파**:
  - 출금 트랜잭션 $Tx_A$ 수정 시 $\rightarrow$ $Tx_B$ (입금)도 금액/일자 즉시 동기화.
  - $Tx_A$ 삭제 시 $\rightarrow$ $Tx_B$도 자동 연쇄 삭제(Cascade Cancel)되어 가계부 간 잔액 오차(Imbalance) 원천 차단.
- **집계 파이프라인**: 모든 가계 대시보드 및 리포트 집계 쿼리는 `is_asset_transfer = false` 조건을 기본 필터로 주입하여 순수 소비/수입과 자산 재배치를 엄격히 격리.

### 5.2 장부 생명주기 상태머신 (Ledger Lifecycle State Machine)
- **단기 장부 (`SHORT_TERM`)**:
  - `OPEN` (진행/지출 입력) $\rightarrow$ `SETTLING` (정산 계산/차액 이체) $\rightarrow$ `CLOSED` / `SETTLED` (읽기 전용 보관).
  - 마감 시점의 결산 영수증(Closing Statement) 스냅샷 생성.
  - 방장 권한 및 `allow_reopen` 옵션에 따라 필요 시 `OPEN` 복구 가능.
- **용돈기입장 (`POCKET_MONEY`)**:
  - `budget_cap` (한도) 대비 누적 실지출(`spent_amount`) 실시간 소진율 모니터링.
  - 주기별(`reset_cycle`: MONTHLY/WEEKLY) 리셋 시 잔여금 이월/소멸 정책 제어.

---

## 6. 전역 원자 지출(Atomic Expense SSOT) & N개 멀티 증빙 대사 아키텍처

### 6.1 불변 원자 지출 단일 진실 원천 (Global Atomic Expense SSOT)
- **전역 유일성**: 실제 발생한 모든 금융 사건(Financial Event)은 `atomic_expenses` 엔티티로 시스템 전역에 단 1건만 불변 기록됩니다.
- **프로젝션 귀속(Ledger Allocation Mapping)**:
  - 장부(`ledgers`)는 원자 지출을 소유하지 않고 다대일 매핑(`ledger_allocations`)으로 참조합니다.
  - 장부에서 제외/삭제되어도 원자 데이터는 파기되지 않고 `allocation_status = 'UNALLOCATED'`로 격리됩니다.
- **미아 데이터(Orphan Data) 수명주기(TTL/GC)**:
  - `UNALLOCATED` 상태로 남아있는 미할당 데이터는 설정된 유예 기간(기본 90일) 동안 보존된 후 가비지 컬렉션(GC) 백그라운드 태스크에 의해 안전하게 정리됩니다.

### 6.2 N개 무제한 멀티 증빙 체인 (Multi-Proof Convergence)
- 단일 원자 지출 엔티티에 N개의 증빙(`expense_proofs`)이 1:N 관계로 바인딩됩니다:
  - `MANUAL`: 사용자가 수기 입력한 메모/금액
  - `RECEIPT_OCR`: 영수증 사진 및 품목(Itemized Menu) 세부 단가
  - `SMS_NOTIFICATION`: 카드사 결제 승인 문자/알림톡
  - `STATEMENT_LINE`: 월말 카드 이용대금명세서 최종 확정 라인 (Golden Record)
- **대사 수렴 엔진 (Reconciliation Engine)**:
  - `PENDING` (가승인) $\rightarrow$ `CONFIRMED` (카드명세서 대사 완료 확정).
  - 카드사 청구할인(-1,000원) 및 포인트 적립 등 금융 조정액이 원자 지출에 자동 반영되어 실제 통장 출금액과 100% 일치 보장.

---

## 7. 운영비 0원 온디맨드 스토리지 수명주기 아키텍처 (Zero-Cost Storage Tiering)

- **계층화(Tiering) 정책**:
  - **Tier 1 (최근 30일 활성기)**: 경량 WebP 썸네일(15KB) + 원본 이미지 상시 접근.
  - **Tier 2 (30일 초과 보관기)**: 원본 이미지를 월별 tarball(`proofs_YYYY_MM.tar.gz`)로 압축 보관. 메타데이터 DB는 썸네일 경로만 인덱싱.
- **온디맨드 임시 해제 & 운영 정책별 파기 (On-Demand Decompress & Configurable Cache Purge)**:
  - 사용자가 과거 원본 증빙을 요청한 순간에만 백엔드가 tarball에서 단건 스트림을 메모리/임시 캐시에 일시 해제.
  - **파기 정책 운영 옵션 (`stream_cache_purge_policy`)**:
    - `INSTANT` (기본값): 모달 닫힘 감지 시 메모리 즉시 파기 (홈서버 2GB RAM OOM 상한선 원천 방어).
    - `1_DAY`: 당일 재조회 편의를 위해 24시간 임시 LRU 캐시 유지 후 자동 소멸.
---

## 8. 지출원장-장부 단방향 참조 및 통장 미등록 계좌 자동수집 아키텍처

### 8.1 지출원장 단방향 참조 원칙 (DDD Decoupling)
- **개념**: 지출내역 원장(`ExpenseRecord`)은 특정 장부(Ledger)의 존재를 전혀 알지 못합니다 (`ledger_id` 미보유). 실세계의 원자적 결제 사건만을 독립 보존합니다.
- **장부 귀속**: 개별 장부 엔티티(`LedgerExpenseItem`)가 `expense_record_id`를 외래 기준정보로 단방향 참조하여 귀속 금액, 대납 태그, 메모를 관리합니다.
- **효과**: 장부 삭제/이관 시에도 원천 지출 증빙이 안전하게 보존되며, 다중 장부 분할 귀속 및 개인/모임 장부 간 이중계상을 원천 차단합니다.

### 8.2 통장 거래내역 파싱 및 미등록 계좌 자동 수집 (Auto-Discovery)
- **비차단 자동 감지**: 복수 은행(국민, 신한, 토스 등) 통장 파일(CSV/엑셀) 업로드 시 파일 헤더 및 거래 본문에서 미등록 계좌번호/은행명이 발견되어도 업로드를 중단하지 않습니다.
- **임시 등록 및 설정 연계**: `[신규 계좌 자동 감지: 토스뱅크 1000-xxxx-xxxx]` 인라인 칩을 띄워 기본 등록을 마치고, `SCR_SET_01 (사용자설정)` 계좌관리 시스템으로 적재하여 사후 정비를 지원합니다.

### 8.3 장부 종합분석 일간 집계 (Daily Aggregation) & Dirty Checksum 패턴
- **일간 집계 뷰**: 건별 계산 과부하를 방지하기 위해 일별 수입/지출 합계 칩(Daily Aggregation) 타임라인을 기본 제공합니다.
- **Dirty Checksum 패턴**: 과거 거래의 수정/삭제 발생 시 매번 전체 과거 월/연도를 자동 재계산하지 않고, 체크섬 변동을 감지하여 `[⚠️ 과거 데이터 변동으로 재집계가 필요합니다 (재집계 실행)]` 배지를 표시하고 온디맨드로 경량 갱신합니다.

### 8.4 장부 서비스 2대 축(장부작성·분석), 서류철 인덱스 슬라이드 배너 및 보고서 수명주기 아키텍처

- **2대 대축 정보 아키텍처 (2-Axis Information Architecture)**:
  - **축 1: ✍️ 장부작성 (`WRITE`)**: 일상적인 금융 거래의 입력, 증빙 첨부 및 자동 규칙 관리.
    - `3.1.1 수입`: `3.1.1.1 수입내역` (전체 입금 원장 및 복수 은행 거래내역 일괄 등록) + `3.1.1.2 고정수입내역` (급여/이자 등 자동등록 규칙 및 알림 공유).
    - `3.1.2 지출`: `3.1.2.1 지출내역` (일반 지출 원장, OCR 첨부, 3대 뷰 상세조회) + `3.1.2.2 카드지출내역` (카드사 청구명세서 일괄 편집 및 별도 관리).
  - **축 2: 📊 분석 (`ANALYSIS`)**: 거래 데이터를 다각도로 해석하고 영구적인 감사 이력 보존.
    - `3.2.1 현황`: 수입/지출 일간 집계 타임라인, 기간 세그먼트(월/분기/연간), 카드사 대사 Bento 그리드.
    - `3.2.2 보고서`: 불변 스냅샷 이력 테이블, 스냅샷 상세 열람, 온디맨드 실시간 데이터 재수집 엔진.

- **상단 KPI 이원화 아키텍처 (Fixed vs Dynamic Separation)**:
  - **2.1 고정정보 (Fixed KPI)**:
    - 가계부 총 잔액, 수입합계금액, 지출합계금액 3개 카드를 상시 표시하여 한눈에 재무 건전성 조망.
  - **2.2 유동정보 서류철 인덱스 슬라이드 배너 (Dynamic Folder Slide Banner)**:
    - 자산이동, 개인대납, 모임정산, 게스트할당 등 서비스 관련 정보가 존재하는 경우에만 조건부 노출(`hasDynamicInfo`).
    - 세로형 인덱스 탭 스타일링으로 파일에서 꺼내는 듯한 시각적 계층감 부여.
    - `useEffect` 기반 1초(1,000ms) 자동 슬라이딩 인터벌 탑재 (마우스 호버 감지 시 일시정지, Play/Pause 수동 토글, 이전/다음 탐색 버튼).
    - **핸들 기능 (`Maximize2` / `Minimize2`)**: 요약 서류 클릭 시 슬라이드가 세부 정보(승인번호, 일자, 감사 무결성 배지 등)로 매끄럽게 펼쳐지는 확장 인터랙션 제공.

- **포함 관계 정합성 원칙 (Inclusion Hierarchy Principle)**:
  - **수입 영역**: 고정수입내역은 별개 독립 원장이 아니라, 수입내역의 한 구분정보를 자동등록하고 등록 상황을 알림으로 공유·확인하도록 유도하는 규칙 관리 기능임 (`3.1.1.1 수입내역`에 100% 포함).
  - **지출 영역**: 카드지출내역은 별개 독립 원장이 아니라, 카드 이용대금명세서를 일괄 등록하면서 카드사별 관리를 수행하는 기능이며, 전체 지출내역(`3.1.2.1 지출내역`)에 부분정보로 귀속됨.

- **보고서 스냅샷 및 온디맨드 재수집 아키텍처 (Report Snapshot & Recollect Lifecycle)**:
  - 보고서는 생성 시점의 회계 원장을 동결(Freeze)한 불변 스냅샷(Immutable Snapshot)으로 저장.
  - 사용자가 **[데이터 재수집 & 보고서 생성]**을 실행하면, 현재 시점의 원장 데이터를 즉시 다시 스캔하여 신규 버전 보고서를 생성하고 과거 보고서는 이력 테이블로 누적 관리.

---

## 9. 작업 이력 (History)

| 작업일자 | 이슈ID | 태스크 | 작업자 | 작업내용 | 사용 AI 모델명 | 에이전트 | 참고링크 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-10-07 | 0001 | ARCH-INIT | jkoogit | 초기 아키텍처 설계서 작성 | - | - | docs/02.아키텍처/ |
| 2026-10-13 | 0008 | TASK-LED-ACT-02 | AI Studio Agent | 전역 원자 지출 SSOT, N개 멀티 증빙 대사 및 0원 스토리지 수명주기 아키텍처 수립 | models/gemini-3.8-flash | AI Studio | docs/02.아키텍처/01-architecture-spec.md |
| 2026-10-13 | 0009 | TASK-LED-SCR-01 | AI Studio Agent | 지출원장 단방향 참조(DDD), 통장 미등록계좌 자동수집 파이프라인, 일간집계 및 Dirty Checksum 패턴 명세 반영 | models/gemini-3.8-flash | AI Studio | docs/02.아키텍처/01-architecture-spec.md |
| 2026-10-14 | 0009 | TASK-LED-09-04 | AI Studio Agent | 장부작성·분석 2대 축, 서류철 인덱스 슬라이드 배너, 포함관계 원칙 및 보고서 스냅샷/재수집 아키텍처 명세 수립 | models/gemini-3.8-flash | AI Studio | docs/02.아키텍처/01-architecture-spec.md |

