# [이슈 리뷰 #6-1] 대시보드 게임 안정화 및 SCR-LED-01 가계부 관리·구성원 RBAC 상세 고도화 리뷰

- **문서 ID**: `REV-ISSUE-06-LED-RBAC-01` (`080007`)
- **작성 일자**: 2026-10-12
- **관련 파일**:
  - `src/sample/screen/SCR_GNT_01_비로그인게스트홈.tsx`
  - `src/sample/screen/SCR_LED_01_그룹가계부관리상세.tsx`
  - `src/index.css`
  - `docs/03.디자인/03-화면목록정의서.md`
- **세션 번호**: [0006]
- **태스크 ID**: `TASK-LED-RBAC-01`
- **GitHub Issue**: Issue #9

---

## 1. 개요 및 요구사항 대비 구현 내역

세션 0006에서는 **대시보드 및 게스트홈 게임 안정화(사다리 당첨인원 실시간 동기화, 정산 슬라이드 드래그 휠 전 디바이스 2행 통일, 룰렛 가중치/참가자 인라인 편집, 텍스트 선택 시 시인성 보장, 사다리 선제 예측형 카메라 추적)**와 **`SCR-LED-01` 가계부 책꽂이 스위처, 금전 3대 원칙 시스템 가드레일, 5단계 RBAC 매트릭스 및 게스트 소멸성 원칙 상세 고도화**를 완결했습니다.

### 1.1 주요 구현 항목 요약

| 구분 | 주요 개선 항목 | 구현 방식 및 아키텍처 반영 |
| :---: | :--- | :--- |
| **게임 안정화** | **사다리 당첨인원 다중 동기화** | `winnerCount` 변경 시 안전 범위(`1 ~ members.length - 1`) 내에서 당첨 슬롯(`선택 N`, 🎁)과 통과 슬롯(`통과 N`, 💨)의 비율이 즉각 재배치되도록 반응형 이펙트 보정 |
| **게임 안정화** | **정산 슬라이드 전 디바이스 2행 통일** | PC, 태블릿, 모바일 모두 1행(좌측 증감 인디케이터 + 우측 초기화) 및 2행(전폭 `w-full` 10개 프리셋 칩 슬라이드 드래그 휠)으로 통일 |
| **게임 안정화** | **룰렛 가중치 및 참가자 이름 편집** | 체크박스 라벨 `확률 가중치 및 참가자 이름 설정`으로 확장, 가중치 패널 및 룰렛 캔버스 상단 뱃지 내 인라인 `input` 제공 |
| **UX 개선** | **텍스트 선택 시 시인성 개선** | `src/index.css`에 전역 및 라이트/다크/여명 테마별 `::selection` 고대비 스타일(선명한 인디고 블루 배경 + 순백색 텍스트) 적용 |
| **UX 개선** | **포커스 시 전체 텍스트 자동 선택** | 사다리 상하단, 룰렛, 정산 입력창 전부에 `onFocus={(e) => e.target.select()}` 적용 |
| **게임 UX** | **사다리 선제 예측형 카메라 추적** | 이동 마크가 움직이기 전에 7스텝 앞선 미래 경로(`lookaheadIdx`)를 미리 내다보고, 진행 방향으로 +35px 시야를 선제 확보하여 프레임 단위 보간(`lerp 0.4`)으로 화면을 부드럽게 앞당김 |
| **SCR-LED-01** | **가계부 책꽂이 비주얼 스위처** | 개인(`PERSONAL`), 가족 그룹(`GROUP`), 모임 인스턴스(`INSTANCE`) 3종 가계부를 3D 책등 비주얼로 책꽂이에 배치하고 즉시 전환 인터랙션 제공 |
| **SCR-LED-01** | **금전관리 3대 원칙 시스템 가드레일** | ① 단일 귀속성: 가계부별 배타적 귀속 보장 배너<br>② TRANSFER 분리: 자산 이동 건 생활비 통계 제외, 보라색 인덱스, 통계 카드 분리 집계, 분리 표시 토글<br>③ 태깅 분리: 대납/정산 태그(`['대납', '정산요청']`)를 통한 이중계상 원천 차단 |
| **SCR-LED-01** | **5단계 RBAC 권한 매트릭스** | `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `GUEST` 역할별 권한 배지, 역할 변경 드롭다운, 조작 가드레일, 상단 '내 권한 시뮬레이터' 탑재 |
| **SCR-LED-01** | **게스트 소멸성(Transient) 가드레일** | 인스턴스 가계부 내 임시 `guest_id` 뱃지 및 정식 회원 전환 시 소급 매핑 방지 안내 배너 적용 |

---

## 2. 코드 레벨 상세 분석

### 2.1 한 템포 앞선 예측형 선제 카메라 추적 (`SCR_GNT_01`)
```tsx
// 한 템포 앞선 예측형 선제 카메라 추적 (Pre-emptive Lookahead Camera Tracking)
if (ladderSliderRef.current) {
  const el = ladderSliderRef.current;
  const maxScroll = el.scrollWidth - el.clientWidth;
  if (maxScroll > 0) {
    const lookaheadIdx = Math.min(memberPoints.length - 1, stepIdx + 7);
    const futureX = memberPoints[lookaheadIdx]?.x ?? pt.x;
    // 이동 방향으로 시야를 35px 선제 확보
    const leadOffset = futureX > pt.x ? 35 : futureX < pt.x ? -35 : 0;
    const targetCenterScroll = futureX + leadOffset - el.clientWidth / 2;
    const clampedScroll = Math.max(0, Math.min(maxScroll, targetCenterScroll));

    // 프레임 틱 단위 신속 보간 (선제적으로 화면을 앞당겨 토큰보다 먼저 뷰포트 확보)
    const diff = clampedScroll - el.scrollLeft;
    if (Math.abs(diff) > 1.5) {
      el.scrollLeft += diff * 0.4;
    }
  }
}
```

### 2.2 고대비 텍스트 선택 규격 (`src/index.css`)
```css
::selection, input::selection, textarea::selection {
  background-color: #4f46e5 !important;
  color: #ffffff !important;
  text-shadow: none !important;
}
html.dark ::selection, html.dark input::selection, html.dark textarea::selection {
  background-color: #6366f1 !important;
  color: #ffffff !important;
}
html.dawn ::selection, html.dawn input::selection, html.dawn textarea::selection {
  background-color: #2563eb !important;
  color: #ffffff !important;
}
```

---

## 3. 검증 결과 및 품질 지표

- **TypeScript Lint (`tsc --noEmit`)**: 0 Errors (통과)
- **Vite Production Build (`npm run build`)**: 0 Errors (빌드 성공)
- **도메인 규칙 무결성**: 금전관리 3대 원칙 및 게스트 소멸성 원칙 100% 준수
