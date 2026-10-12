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


