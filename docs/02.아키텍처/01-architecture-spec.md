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


