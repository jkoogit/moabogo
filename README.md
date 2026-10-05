# 모아보고 (MoaBogo) - 스마트 가계부 & 모임 생활 지원 플랫폼

> **공식 도메인**: `moabogo.com`  
> **핵심 가치**: "모아서 분석하고 한눈에 보고!" - 1인 다중 가계부, 독립 모임 이벤트, 확장 라이프(당번/용돈/대여) 서비스

---

## 📌 프로젝트 개요

**모아보고(MoaBogo)**는 개인과 모임/가족의 금융 및 생활 과업을 유연하게 통합 관리하는 스마트 PWA 플랫폼입니다.
구글 AI 스튜디오(Google AI Studio), Cursor, Claude Code 등의 AI 바이브 코딩(Vibe Coding) 도구가 이 저장소를 직접 참조하여 오차 없이 정확한 코드를 생성할 수 있도록 요구사항 정의서(PRD), 아키텍처 사양, DDL 스크립트를 완전히 내장하고 있습니다.

---

## 🚀 주요 기능 요약

1. **1인 다중 가계부 (Multi-Ledger)**
   - 가입 즉시 `[내 개인 가계부]` 자동 생성 (Zero-Onboarding).
   - 필요 시 `[우리집 가계부]`, `[동창 모임]` 등 그룹 가계부 추가 및 RBAC 권한 분리.
   - `인스턴스가계부` 를 그룹가계부와 구분하여 별도 관리 가능.(예: `[2026 상반기 동창 모임]`)
2. **안전한 2단계 OCR & 오프라인 PWA**
   - 1차 우분투 로컬 OCR (EasyOCR) -> 2차 사용자 등록 개인 API Key 전용 (서버 운영비 0원).
   - 오프라인 캐싱 지원 및 온라인 재연결 시 충돌/삭제 내역 무효화(Cancel/Stale) 가드레일.
3. **독립 이벤트 & 3대 빅테크 간편 송금**
   - 1/N 정산, 사다리타기, 술래잡기 등 제약 없는 개방형 게임.
   - 게스트 포함 시 전체 자동 연동 차단 -> 결과 화면에서 연동 가능 대상만 `[수동 연동]` 활성화.
   - 카카오페이(`kakaopay://`), 토스(`supertoss://`), 네이버페이(`naverpay://`) 3초 딥링크 이체.
4. **확장 라이프 서비스 (모아3종)**
   - **모아당번 (MoaDuty)**: 회원/게스트 순번 집안일 지정, 사진 인증 및 `ENDED(수행)` / `COMPLETED(승인)` 상태 머신.
   - **모아용돈 (MoaAllowance)**: 사유 요청 -> 딥링크 이체 -> 가계부 수입/지출 연동 (그룹 가계부 내부 이동 처리).
   - **모아빌림 (MoaLoan)**: 가족/지인 간 차용 및 분할 상환 트래킹 (**소비 지출이 아닌 자산/부채 이동**으로 회계 분리).
5. **LETO 스타일 UI/UX (app.leto.kr 벤치마킹)**
   - Bento Grid 대시보드, `⌘K` 커맨드 팔레트, 모던 B2B SaaS 디자인 톤.

---

## 📂 저장소 문서 구조 (`/docs/`)

AI 도구가 개발을 시작할 때 반드시 아래 `/docs/` 문서를 순서대로 읽고 참조하도록 안내하세요.

```text
/
├── README.md                                    # 마스터 저장소 설명서 (본 파일)
└── docs/
    ├── 00.인프라
    |   ├─ 00.문서관리
    |   |  └─ 01.문서관리정책.md                   # 문서관리정책
    |   └─ 01.바이브코딩
    |      └─ 01.moabogo-vibe-coding-master-docs.md # 바이브 코딩 마스터 통합 문서
    ├── 01.프로젝트
    |   └─ 01-prd-spec.md                        # 제품 요구사항 정의서 (PRD)
    ├── 02.아키텍처
    |   └─ 01-architecture-spec.md               # 시스템 및 데이터 아키텍처
    ├── 03.디자인
    |   └─ 01-design-api-spec.md                 # UI/UX & API/딥링크 규격서
    └── 04.데이터
        ├─ 01.데이터설계.md                        # 데이터설계
        └─ 02-erd-schema.sql                     # PostgreSQL 16 DDL 스크립트
```

---

## 🤖 구글 AI 스튜디오 (Google AI Studio) 지시 프롬프트

구글 AI 스튜디오 또는 Cursor 프로젝트 시작 시 아래 프롬프트를 입력하세요:

```text
[System Instruction for MoaBogo Project]
You are a senior full-stack engineer developing '모아보고 (MoaBogo)' (moabogo.com).
Please read and strictly follow the specs in README.md and all documents in /docs/: 
- /docs/00.인프라/00.문서관리/01.문서관리정책.md (인프라 정책)
- /docs/01.프로젝트/01-prd-spec.md (PRD & Business Logic)
- /docs/02.아키텍처/01-architecture-spec.md (Ubuntu/Docker Resource Limits & Task State Machine)
- /docs/03.디자인/01-design-api-spec.md (LETO Design System & BigTech Deep Links)
- /docs/04.데이터/01-erd-schema.sql (PostgreSQL 16 Schema)
Generate modular, clean, and production-ready code based on these exact specifications.
```
