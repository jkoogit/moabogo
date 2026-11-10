# [이슈리뷰 0031-02] 사다리·룰렛 hostToken 기반 권한 위조 방지, 원자적 자리점유 및 게임중 조작잠금 즉시 조치

- **문서 ID**: `08003102`
- **관련 태스크**: `[0031-02]`
- **작성일자**: 2026-11-10
- **상태**: 완료 (Merged to dev & stg/main Fast-Forward Promoted)
- **작성자**: MoaBogo AI Agent Harness

---

## 1. 개요 및 목적

사다리·룰렛 실시간 방 공유 서비스(`SCR-GNT-01`)에 대해 프로세스 및 보안 취약점을 종합 진단한 결과 식별된 문제를 2단계(즉시 조치 vs 차기 백엔드 고도화)로 분리하고, 프론트엔드 및 인메모리 Express 계층에서 취할 수 있는 최선의 보안 조치를 완결하였습니다.

1. **방장 권한 위조 방어**: URL 쿼리 파라미터 `&host=1` 조작 공격 무력화 및 난수 토큰(`hostToken`) 체계 수립
2. **원자적 자리 점유 보장**: 동일 좌석에 대한 동시 다발적 찜하기 경합 방지
3. **진행 중 조작 전면 차단 (In-Game Lock)**: 사다리 트레이싱 및 룰렛 회전 중 상태 변경 차단
4. **차기 백엔드 과제 백로그화**: 분산 락, 서버 권위 CSPRNG 결과 서명, 30초 Heartbeat 자동 방장 승계(`BKL-LAD-03`)

---

## 2. 주요 구현 및 변경 내역

### 2.1 백엔드 (`server.ts`)
- **`hostToken` 발급 및 보관**: 방 생성 시 128비트 암호학적 난수(`crypto.randomBytes(16).toString('hex')`)를 생성하여 방 오너에게 1회 제공
- **방장 전용 액션 검증 가드**: `PLAY_LADDER`, `SPIN_ROULETTE`, `SHUFFLE_MEMBERS`, `SHUFFLE_RUNGS`, `SHUFFLE_GOALS`, `SYNC_ROULETTE_ITEMS`, `SHUFFLE_ROULETTE_ITEMS`, `CLOSE_ROOM`, `RESET_GAME`, `RESET_ROULETTE` 호출 시 `x-host-token` 헤더 대조 (불일치 시 `403 Forbidden` 반환)
- **원자적 자리 점유 가드**: `CLAIM_SEAT` 시 이미 다른 참가자(`claimedBy`)가 점유한 자리일 경우 `409 Conflict (SEAT_ALREADY_CLAIMED)` 반환

### 2.2 프론트엔드 채널 레이어 (`ladderSyncChannel.ts`, `rouletteSyncChannel.ts`)
- `LadderChannelHandle` 및 `RouletteChannelHandle`의 `send` 메서드에 `hostToken` 파라미터 지원 추가
- 액션 릴레이 POST 요청 시 `x-host-token` 헤더 동봉

### 2.3 프론트엔드 게임존 (`LadderGameZone.tsx`, `RouletteGameZone.tsx`)
- **`host=1` URL 노출 완전 제거**: 초대 링크 및 방 생성 후 주소창 치환 시 `host` 쿼리 파라미터 제외
- **`sessionStorage` 격리 판정**: 방장 판정을 오직 브라우저 탭 세션 스토리지의 `moabogo_host_token_<roomId>` 존재 여부로만 결정
- **방 이탈 시 세션 토큰 즉시 파기**: 공유 방 이탈 시 세션 스토리지 토큰 삭제
- **진행 중 조작 잠금**: `isLadderTracing` 또는 `isSpinning` 상태일 때 좌석 찜하기, 매장 메뉴 변경, 이름 수정 차단 토스트 안내

### 2.4 백로그 명세서 갱신 (`docs/01.프로젝트/02-backlog-spec.md`)
- **`BKL-LAD-03`** (P1) 신설: RDBMS 세션 바인딩, Redis Redlock 기반 분산 락, 서버 권위 CSPRNG 결과 서명, 30초 Heartbeat 방장 자동 승계 FSM 명시

---

## 3. 정적 검증 결과

- **`compile_applet`**: `Build succeeded` (정상 컴파일)
- **`lint_applet` (`tsc --noEmit`)**: `Linting completed successfully` (0-Error, 타입 무결성 검증 완료)
