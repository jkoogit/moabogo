# [화면리뷰] 인증 및 오프라인 세션(SCR_AUT_01, SCR_AUT_02, SCR_OFF_01) 마감 점검 완결

- **문서 ID**: `080048-03`
- **버전**: v1.0
- **작성 일자**: 2026-11-25
- **작성 세션**: `[0048]` (`[0048-03]`)
- **대상 화면**: `SCR_AUT_01` (회원가입), `SCR_AUT_02` (로그인 & 오프라인 세션), `SCR_OFF_01` (오프라인 동기화 뷰어)
- **추적 이슈**: GitHub Issue [#127](https://github.com/jkoogit/moabogo/issues/127)
- **검토 승인자**: MoaBogo Core Product & Frontend Architecture Team

---

## 📌 1. 개요 및 마감 점검 배경

`261122 1차 우선작업계획`의 마지막 프론트엔드 마감 과제(7순위)로서, 회원가입(`SCR_AUT_01`)과 로그인·오프라인 세션(`SCR_AUT_02`), 그리고 오프라인 동기화 안내 뷰어(`SCR_OFF_01`) 간의 실제 IndexedDB 오프라인 세션 토큰 유지 흐름과 360px 모바일 뷰포트 정합성을 일괄 점검·보완했습니다.

---

## 🛠️ 2. 주요 구현 및 고도화 상세 내역

| 영역 | 대상 모듈 / 파일 | 핵심 구현 및 리뷰 검증 내역 |
| :--- | :--- | :--- |
| **IndexedDB 오프라인 세션<br>저장소 구축** | `src/sample/data/offlineSessionStore.ts` | • `indexedDB.open('moabogo_auth_db', 1)` (`offline_sessions` 스토어) 기반 비동기 저장·조회·폐기 및 `localStorage`(`moabogo_offline_session_v1`) 동기 미러 폴백 구현.<br>• `getCachedOfflineSession`, `hydrateOfflineSessionFromIDB`, `issueOfflineSession`, `extendOfflineSession`, `revokeOfflineSession` 및 `OFFLINE_SESSION_CHANGED_EVENT` 브로드캐스트 제공. |
| **공용 인증 UI &<br>세션 토큰 카드 분리** | `src/sample/screen/auth/AuthSharedParts.tsx`<br>`src/sample/screen/auth/OfflineSessionTokenCard.tsx` | • `SCR_AUT_01`/`SCR_AUT_02` 중복 소셜 3사 버튼(`SocialAuthButtons`) 및 인라인 알림(`AuthFeedbackAlert`) 분리.<br>• `SCR_AUT_02`/`SCR_OFF_01` 공용 `OfflineSessionTokenCard` 분리로 토큰 마스킹(`maskedToken`), 만료일시, 7일 연장, 재발급, 폐기, 캐시 세션 즉시 진입 UX 통일. |
| **`SCR_AUT_01` 회원가입<br>360px & 오프라인 가드레일** | `src/sample/screen/SCR_AUT_01_회원가입.tsx` | • 이메일 입력/인증코드 행 `flex-1 min-w-0` 적용, 소셜 3열 `min-w-0`·`px-1.5` 조정, 약관 행 `flex-wrap` 및 보조 링크 `min-h-[44px]` 보정.<br>• `isOffline` 시 신규 가입·소셜 버튼 비활성화 및 오프라인 세션 로그인(`SCR-AUT-02`) 이동 안내 배너 추가, 가입 성공 시 `issueOfflineSession` 연동. |
| **`SCR_AUT_02` · `SCR_OFF_01`<br>& `App.tsx` 전역 연동** | `src/sample/screen/SCR_AUT_02_로그인오프라인세션.tsx`<br>`src/sample/screen/SCR_OFF_01_오프라인동기화.tsx`<br>`src/App.tsx` | • `App.tsx`의 전역 `isOffline`, `onToggleOffline`, `onOpenOfflineViewer`를 `SCR_AUT_02`에 양방향 연결하고 `SCR_OFF_01`에 `onGoLogin` 연결.<br>• 오프라인 단절 시 소셜 OAuth 비활성화 및 `OfflineSessionTokenCard`를 통한 캐시 세션 즉시 로그인·`SCR-OFF-01` 동기화 뷰어 연동.<br>• 비표준 `flex-2` 클래스 제거(`flex-col sm:flex-row` + `flex-1`), `ElmSwt01` 다크모드 텍스트 대비 및 `SCR_OFF_01` 44px 터치 타깃 보정 완료. |

---

## 🏛️ 3. 아키텍처 · 오프라인 가드레일 · 반응형 점검 결과

1. **오프라인 가드레일 (`04-리팩토링 표준지침 §7`)**:
   - 네트워크 단절 시 외부 소셜 로그인 및 신규 가입은 `disabled` 처리하고, 기기에 캐시된 IndexedDB 세션 토큰이 있을 때만 원클릭 오프라인 대시보드 진입을 허용합니다.
2. **SRP 및 모듈 크기 준수**:
   - 공용 컴포넌트 분리로 `SCR_AUT_01`(452줄), `SCR_AUT_02`(477줄), `SCR_OFF_01`(350줄) 모두 500줄 이하로 유지했습니다.

---

## 🧪 4. 정적 타입 및 컴파일 검증 결과

```bash
✓ npx.cmd tsc --noEmit (TypeScript 0-Error 통과)
✓ npm.cmd run build (Vite 프로덕션 번들링 2,042 모듈, 0-Error 통과, built in 3.42s)
```
