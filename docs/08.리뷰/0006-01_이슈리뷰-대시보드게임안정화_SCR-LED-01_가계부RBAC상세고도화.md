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

### 1.2 사용자 피드백 반영 4대 정보구조(IA) 정제 내역

| 구분 | 피드백 및 기존 문제점 | 개선 및 구현 방식 |
| :---: | :--- | :--- |
| **타이틀 정제** | `가계부 관리 및 구성원 RBAC 상세`의 전문용어로 인한 인지부하 | **`가계부 관리`**로 간결하게 축약하고 부제도 "가족·개인·모임 장부 전환 및 참여자 권한 설정"으로 순화 |
| **가드레일 분리** | 본문 중간에 거대한 가드레일 배너가 끼어 시선 차단 | 본문 배너 완전 제거. 타이틀 우측 **물음표(❓) 도움말 버튼** 탑재 ➔ 클릭 시 **[모아보고 금전관리 3대 원칙 레이어 팝업]** 모달 제공 |
| **책꽂이 컴팩트화** | 카드 내 중복 수치 나열로 위상 모호 | **가계부 전환 스위처(Book Spine Rack)** 본연의 역할에 집중. 책등 컬러, 가계부명, 유형 뱃지, 인원수만 컴팩트하게 노출하고 4번째 슬롯에 `+ 새 가계부 만들기` 카드 배치 |
| **등록 액션 위계 분리** | `새 거래 등록`과 `새 가계부 만들기` 버튼의 혼선 | • **새 거래 등록**: 거래 내역 리스트 우측 상단 메인 액션으로 단일화<br>• **새 가계부 만들기**: 책꽂이 슬롯 끝 `+` 카드로만 단일화하여 위계 완벽 분리 |

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


### 1.4 [카툰 일러스트 오브젝트화] 사용자 피드백 기반 상대두께·안경제거·상단뱃지필터·왼쪽독립핸들 고도화
- **개편 배경**: 카드형 UI나 복잡한 서재 배경을 배제하고, 순수 일러스트 책 더미 구조에서 4대 핵심 요구사항(금액별 상대두께, 안경 제거, 상단 유형 뱃지 필터, 왼쪽 독립 순서변경 핸들)을 완벽 구현.
- **4대 구현 핵심**:
  1. **[요구사항 1] 전체 장부 기준 상대적 금액 비례 책 두께 (최고 금액 = 2.0배 두께)**:
     - 정액 기준이 아닌, 화면 필터링 여부와 무관하게 **전체 장부(`ledgers`) 중 최대 금액(`overallMaxBalance`)을 기준**으로 상대적 두께 스케일(`1.0x ~ 2.0x`) 동적 산출.
     - 최대 금액 장부(12,500,000원)는 기본 책 대비 정확히 2.0배 두께(높이 108px/viewBox 152)로 묵직한 백과사전 양장본 룩을 연출하며, 금액이 적을수록 슬림하게 표현.
     - SVG의 둥근 척추(Spine), 종이 결 라인(Page Grooves), 리브 밴드(Raised Ribs), 타이틀 카르투슈(Cartouche)가 두께에 맞추어 수학적으로 비례 스케일링되어 그래픽 왜곡 없이 실물 책 느낌 전달.
  2. **[요구사항 2] 안경 오브젝트 완전 제거 (오해 정정)**:
     - 책 더미 상단에 얹혀 있던 안경(Vintage Reading Glasses) 일러스트를 완전히 제거하여 시각적 군더더기를 없애고 순수 책 더미에 시선을 집중.
  3. **[요구사항 3] 상단 뱃지 선택 필터 (전체/그룹/개인/인스턴스)**:
     - 책 더미 상단 제어 바에 직관적인 **유형 뱃지 탭(`[전체]`, `[그룹]`, `[개인]`, `[인스턴스]`)** 배치.
     - 각 뱃지별 실시간 보유 권수(`count`)를 표기하며, 클릭 시 즉각 필터링 적용.
     - 필터링된 상태에서도 책 두께는 전체 장부 기준의 상대 금액 비율을 그대로 유지하여 도메인 일관성 보장.
  4. **[요구사항 4] 책 이미지와 물리적으로 분리된 '왼쪽 독립 드래그 핸들'**:
     - 책등 우측에 있던 드래그 핸들을 책 이미지 외부로 완전히 독립시켜 **각 책의 왼쪽 컬럼에 전용 메탈 플레이트 핸들(`GripHorizontal` + 두 자리 순번 `01, 02...`)**로 배치.
     - 데스크톱 마우스 HTML5 Drag & Drop 및 모바일/태블릿 터치 드래그(`onTouchStart/Move/End`) 완벽 연동.
     - 핸들이 왼쪽으로 분리됨으로써 책등 내부 라벨 플레이트가 최대 너비(68~70%)를 확보하여 긴 장부 타이틀도 말줄임과 함께 시원하게 노출되고, 책 클릭(선택)과 순서 드래그가 물리적으로 분리되어 오조작 원천 차단.


