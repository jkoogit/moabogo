# [0032-01] 코드리뷰 — 방공유 RBAC 고도화 · Presence 안정화 · 룰렛 권한 세분화

| 항목 | 내용 |
|------|------|
| **태스크 ID** | `[0032-01]` |
| **세션** | `[0032]` 게임공유 화면기능 고도화 |
| **GitHub Issue** | [#85](https://github.com/jkoogit/moabogo/issues/85) |
| **작업 브랜치** | `task/0032_01_게임공유_화면기능_고도화` |
| **검증 결과** | `tsc --noEmit` ✅ 0-Error / `vite build` ✅ 0-Error |
| **리뷰 날짜** | 2026-11-11 |

---

## 1. 변경 요약

### 1-1. Presence Grace Period 1,500ms 도입 (`server.ts`)

**문제**: SSE 연결 종료 시 `connectedTabs.delete` 직후 즉각 브로드캐스트하여 접속자 수가 1→2→1→2 핑퐁 발생.

**해결**:
```typescript
const TAB_DISCONNECT_TIMERS = new Map<string, NodeJS.Timeout>();

req.on('close', () => {
  const timer = setTimeout(() => {
    connectedTabs.delete(tabId);
    broadcast({ type: 'PRESENCE_UPDATE', ... });
  }, 1500);
  TAB_DISCONNECT_TIMERS.set(tabId, timer);
});

// 재연결 시 타이머 즉시 취소
if (TAB_DISCONNECT_TIMERS.has(tabId)) {
  clearTimeout(TAB_DISCONNECT_TIMERS.get(tabId)!);
  TAB_DISCONNECT_TIMERS.delete(tabId);
}
```

**효과**: 탭 새로고침·네트워크 순간 단절로 인한 false 이탈 감지 완전 차단.

---

### 1-2. RBAC Matrix v2.0 — 사다리 섞기 · 룰렛 섞기 게스트 허용 (`server.ts`)

**변경 전**:
```typescript
const HOST_ONLY_ACTIONS = [
  'SHUFFLE_RUNGS', 'SHUFFLE_GOALS',
  'SYNC_ROULETTE_ITEMS', 'SHUFFLE_ROULETTE_ITEMS',
  ...
];
```

**변경 후**: 위 4개 액션을 `HOST_ONLY_ACTIONS`에서 제거 → 참가자 공통 허용.

| 액션 | 변경 전 | 변경 후 |
|------|---------|---------|
| `SHUFFLE_RUNGS` | 방장 전용 | **참가자 허용** |
| `SHUFFLE_GOALS` | 방장 전용 | **참가자 허용** |
| `SHUFFLE_ROULETTE_ITEMS` | 방장 전용 | **참가자 허용** |
| `SYNC_ROULETTE_ITEMS` | 방장 전용 | **참가자 허용** |
| `UPDATE_MEMBER_DETAILS` | 없음 | **신규 추가 (claimedBy 검증)** |

**`UPDATE_MEMBER_DETAILS` 서버 처리 로직**:
- 발신 `tabId`가 해당 멤버의 `claimedBy`와 일치하거나, `hostToken`이 일치하는 경우에만 적용.
- 이름, 아바타 이모지, 선택 메뉴를 실시간으로 모든 참가자에게 브로드캐스트.

---

### 1-3. 사다리 — 게스트 섞기 · 아바타 편집 · 즉시결과 셔플 (`LadderGameZone.tsx`)

#### (a) 게스트 섞기 허용
- `handleReshuffleRungs`, `handleShuffleGoals`의 `isGuest` 가드 제거.
- 가로줄/목표 섞기 버튼 `disabled` 조건에서 `isGuest` 제거.

#### (b) 아바타 편집 (`avatarPickerMemberId` state)
- 24종 `PRESET_AVATAR_EMOJIS` 상수 정의.
- 내 자리 아이콘 클릭 → 아바타 피커 모달 오픈.
- `handleSelectAvatarForMember`: 선택된 이모지를 본인 멤버에 적용 후 `UPDATE_MEMBER_DETAILS`로 채널 전파.
- `handleUpdateMemberName`: `claimedBy` 체크 추가, `UPDATE_MEMBER_DETAILS`로 전파 변경.
- `handleSelectMenuForMember`: `UPDATE_MEMBER_DETAILS` 채널 전파 추가.

#### (c) 즉시결과 셔플 초기화
```typescript
const handlePlayLadder = async (skipTrace: boolean) => {
  if (skipTrace) {
    const newSeed = ladderSeed + 1;
    const shuffledRungs = generateLadderRungs(newSeed, members.length, ...);
    setLadderSeed(newSeed);
    await handleSkipToResult(shuffledRungs); // override rungs 주입
  }
  ...
};
```

`handleSkipToResult(overrideRungs?: LadderRung[])` 시그니처 확장:
- 즉시결과 호출 시 순간 셔플된 새 가로줄로 계산.
- 기존 `ladderRungs` useMemo와 독립적으로 동작.

---

### 1-4. 룰렛 — 게스트 섞기·프리셋 허용 · presetTitle 동기화 (`RouletteGameZone.tsx`)

- `handleShuffleRouletteItems`: `isGuest` 가드 제거 (스피닝 중만 차단).
- `handleSelectPreset`: `SYNC_ROULETTE_ITEMS` 채널 전파 + `presetTitle` 포함.
- 항목 섞기·추천 프리셋 버튼 `disabled`에서 `isGuest` 제거.
- `SYNC_ROULETTE_ITEMS` 수신 시 `presetTitle` 동기화 처리.

#### 채널 타입 확장 (`rouletteSyncChannel.ts`):
```typescript
{ type: 'SYNC_ROULETTE_ITEMS'; items: RouletteItem[]; presetTitle?: string }
```

---

### 1-5. 사다리 채널 타입 추가 (`ladderSyncChannel.ts`)

```typescript
| { type: 'UPDATE_MEMBER_DETAILS'; memberId: string; name?: string; avatarEmoji?: string; selectedMenu?: any }
```

---

### 1-6. 토스트 3초 표준화 (`Tokens.tsx`, `SCR_GNT_01`)

- `ElmToast01` 기본 `duration`: 2800ms → **3000ms**.
- `SCR_GNT_01`의 토스트 호출에 `duration={3000}` 명시.

---

### 1-7. 통합 방 공유 URL 연속성 (`SCR_GNT_01_비로그인게스트홈.tsx`)

- `currentRoomId` useMemo: URL `room` 파라미터 취득.
- `handleSwitchGameTab`: 탭 전환 시 URL `game` 파라미터 동기화 + `room` 파라미터 보존.
- 방 공유 참여 중 배너:
  ```
  방 공유 참여 중 · 혼자 따로 하기 (새 탭) ↗
  ```

---

## 2. 검증 결과

```
$ pnpm.cmd run lint   → ✅ ESLint 0-warnings
$ pnpm.cmd run build  → ✅ vite build 2117 modules, 2.05s, 0-Error
```

---

## 3. 미완료 / 다음 태스크 (`[0032-02]`)

| 항목 | 상태 |
|------|------|
| 사다리 추적 좌표 SSE 실시간 동기화 (`LADDER_TRACE_UPDATE`) | ⬜ 미착수 |
| 앵커 카메라 스크롤 & 반칸 여백 | ⬜ 미착수 |
| 앵커 완주 후 다음 참가자 카메라 패닝 | ⬜ 미착수 |
| 게임 완료 시 링크 참가자 결과 모달 자동 오픈 | ⬜ 미착수 |

---

## 4. 변경 파일 목록

| 파일 | 변경 유형 |
|------|----------|
| `server.ts` | 수정 (Presence Grace Period, RBAC) |
| `src/components/game/ladder/LadderGameZone.tsx` | 수정 (게스트 섞기, 아바타, 즉시결과) |
| `src/components/game/ladder/ladderSyncChannel.ts` | 수정 (UPDATE_MEMBER_DETAILS 타입) |
| `src/components/game/roulette/RouletteGameZone.tsx` | 수정 (게스트 섞기, presetTitle) |
| `src/components/game/roulette/rouletteSyncChannel.ts` | 수정 (presetTitle 필드) |
| `src/sample/elements/Tokens.tsx` | 수정 (토스트 3초) |
| `src/sample/screen/SCR_GNT_01_비로그인게스트홈.tsx` | 수정 (URL 연속성, 배너) |
| `docs/02.아키텍처/03-실시간동기화-기술검토서.md` | 수정 (RBAC v2.0, Grace Period) |
