# [BKL-SYS-01] 시스템 운영 관리 독립 접근 경로 (/system) 및 8대 전역 거버넌스 백오피스 구축

> **문서 상태**: 완료 (`COMPLETED`)  
> **등록 세션**: `[0037]`  
> **완료 세션**: `[0039]` (2026-11-17)  
> **관련 도메인**: 시스템 운영 백오피스 (`SCR-SYS-01`), 관리자 권한 (`SYSTEM_ADMIN`), 8대 거버넌스, 20대 마스터 코드, 게임 풀, 12종 알림 매트릭스  

---

## 1. 도입 취지 및 배경 (Why)
- **현황 및 문제점**:
  - 기존 서비스는 비회원(게스트), 로그인 사용자, 사용자 설정(`SCR-SET-01`)만 존재하여, 시스템 관리자가 OAuth 간편로그인 개별 제어, 2FA/이메일인증, 알림 12종 매트릭스, RBAC/약관 버전관리, 금융기능 통제, 20대 마스터 코드, 사다리/룰렛 게임 풀 등을 총괄 통제할 수 있는 공식적인 백오피스가 부재하였음.
- **도입 성과**:
  - 관리자 전용 독립 접근 경로(`/system`, `SCR-SYS-01`)를 단순 인프라 헬스체크에서 **'플랫폼 8대 거버넌스 백오피스'**로 전면 확장 구축 완료.

---

## 2. 8대 전역 거버넌스 구현 성과 (Overview & Implementation)

### 2.1 8대 핵심 거버넌스 영역
1. **로그인 인증 및 보안 설정 (`AUTH_SEC`)**:
   - OAuth 3사(카카오, 네이버, 구글) 간편로그인 전역 및 공급자별 개별 On/Off 스위치.
   - 로그인 2단계 인증(2FA) 적용 정책 및 이메일 인증 필수 여부 설정.
2. **서비스 전역 알림 발송 매트릭스 설정 (`NOTIFY`)**:
   - 인증된 이메일에만 알림 발송 제한 옵션.
   - 12종 알림 토글 (가계부 2종, 당번 4종, 목표 4종, 모아머니 3종).
3. **RBAC 시스템 관리 및 Markdown 약관 거버넌스 (`RBAC_LEGAL`)**:
   - 메뉴 관리, 화면 관리, 권한그룹 관리(SYSTEM_ADMIN, LEDGER_OWNER, MEMBER, GUEST), 사용자 관리.
   - Markdown 포맷 이용약관/개인정보처리방침 렌더링 뷰어, 인라인 편집기, 버전 개정 이력 관리.
4. **금융 기능 컴플라이언스 통제 (`FINANCE`)**:
   - 송금 URL 생성 전역 통제.
   - 세부 통제: 모아목표 수행응원 송금 허용/차단, 모아머니(정산/지원/보상) 송금 허용/차단.
   - 일일 추천 송금 상한액 및 해외 IP 송금링크 생성 원천 차단.
5. **플랫폼 20대 마스터 코드 체계 (`MASTER_CODE`)**:
   - 6대 카테고리 20종 그룹코드 (장부 6종, 금융 5종, 지출이동 2종, 당번 4종, 목표 2종, 정산 1종).
   - 계층형 상세코드 CRUD, 정렬 순서, 기본값 지정, 사용 여부 토글, 뱃지/컬러 메타 관리.
6. **기초 게임 콘텐츠 풀 관리 (`GAME_POOL`)**:
   - 사다리 기초 매장(PLUS CAFE 45층 등) 및 34종 전수 수집 메뉴 풀 관리.
   - 룰렛 기초 프리셋(점심메뉴, 당번정하기, 벌칙룰렛, 커피내기) 및 가중치 관리.
   - 사용자 환경설정(`SCR-SET-01`)과의 양방향 동적 매장/게임 풀 연동.
7. **인프라 실시간 관제 (`INFRA`)**:
   - PostgreSQL 연결 풀(7/20), Cloudflare 터널(42ms), 2GB RAM OOM 격리 버퍼(1,280MB), EasyOCR 큐 실시간 관제.
8. **긴급 점검 및 전역 공지 제어 (`NOTICE`)**:
   - 전역 긴급 점검 모드 강제 송출 스위치, 공지 문구 편집, 전체 설정 공장초기화(Factory Reset).

---

## 3. 아키텍처 및 SSOT 스토어 구조

```
[모아보고 시스템설정 아키텍처]
  ├── src/sample/data/systemGovernancePool.ts (SSOT 스토어 & LocalStorage 동기화)
  │    ├── loadAuthSecurityConfig / saveAuthSecurityConfig
  │    ├── loadNotificationMatrix / saveNotificationMatrix
  │    ├── loadFinancialCompliance / saveFinancialCompliance
  │    ├── loadManagedMenus / loadManagedScreens / loadManagedRoles / loadManagedUsers / loadManagedTerms
  │    ├── MASTER_GROUP_CODES (20종) / loadMasterDetailCodes / saveMasterDetailCodes
  │    └── loadSystemStorePool / loadSystemRoulettePresets / resetAllSystemGovernance
  │
  ├── src/sample/screen/SCR_SYS_01_시스템운영관리.tsx (8대 거버넌스 반응형 UI)
  │    ├── ElmTyp01 타이틀 표준 규격 준수 (360px 2-line 분리)
  │    ├── ElmSld03 8대 탭 슬라이더
  │    └── ElmSwt01, 반응형 테이블, 실시간 토스트 피드백
  │
  └── src/sample/screen/SCR_SET_01_사용자설정.tsx (사용자 설정과 백오피스 연동)
       └── getSystemStorePool()을 통한 기초 매장 풀 실시간 동기화
```

---

## 4. 인수 기준 검증 결과
1. [x] `/system` 경로 접근 시 관리자 전용 독립 대시보드로 8대 거버넌스를 일관되게 제어 가능한가? -> **100% 충족**
2. [x] OAuth 3사, 2FA, 12종 알림 매트릭스, 송금 통제가 중앙 스토어에 안전하게 영속화되는가? -> **100% 충족**
3. [x] 20대 마스터 그룹코드 및 상세코드의 CRUD와 기본값 지정이 반응형 테이블에서 매끄럽게 동작하는가? -> **100% 충족**
4. [x] 사다리 34종 메뉴 및 룰렛 프리셋이 관리되며 사용자 설정(`SCR-SET-01`)과 동적 연동되는가? -> **100% 충족**
5. [x] 모바일 최소 뷰포트(360px) 및 다크/라이트 테마에서 가로스크롤 튐 없이 무결 렌더링되는가? -> **100% 충족**
