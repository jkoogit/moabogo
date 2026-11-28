# [0050-02] 설계리뷰: 21개 전체 화면 폼 필드 1:1 대사 검증 및 PostgreSQL 16 DDL (`init_schema.sql`)

> **문서 상태**: 완료 (`COMPLETED`)  
> **태스크 번호**: `[0050-02]` (세션 이슈 `#134`)  
> **작업 일자**: 2026-11-26  
> **작성자**: AI Engineer (antigravity / Gemini 4 Hydrogen)  
> **주요 산출물**:  
> - `docs/04.데이터/02-화면_DB_1대1_대사검증서.md` (v1.0 신설)  
> - `docs/04.데이터/01.데이터설계.md` (v3.2 — 총 53개 정규 테이블 완결)  
> - `docs/04.데이터/init_schema.sql` (PostgreSQL 16 통합 마이그레이션 DDL & 초기 시드)  
> - `docs/04.데이터/02-erd-schema.sql` (구버전 Deprecated 안내 헤더 반영)

---

## 1. 개요 및 목적 (Overview & Goals)

본 문서는 백엔드 개발 착수 전 프론트엔드 동결 화면 21개(`SCR-AUT-01` ~ `SCR-SYS-01`)의 모든 입력 폼·상태 필드와 [01.데이터설계.md](file:///d:/dev/workspace/git.jkoogit/moabogo/docs/04.데이터/01.데이터설계.md) 물리 컬럼 간의 누락·불일치를 0으로 차단하기 위한 **1:1 대사 검증 결과**와, 이를 100% 반영한 **PostgreSQL 16 실행 DDL([init_schema.sql](file:///d:/dev/workspace/git.jkoogit/moabogo/docs/04.데이터/init_schema.sql))** 구축 내역을 기록합니다.

---

## 2. 21개 전체 화면 1:1 대사 검증 및 보완 결과

| 구분 | 보완 대상 | 반영 내역 |
| :--- | :--- | :--- |
| **인증·약관** (`SCR-AUT-01/02`) | `user_term_agreements` (신설), `users` | 약관 동의 3종(`SERVICE`/`PRIVACY`/`MARKETING`) 버전·동의·철회 이력 테이블 신설 및 `two_factor_enabled_yn`, `two_factor_secret_enc` 보완 |
| **가계부·고정규칙** (`SCR-LED-01`) | `ledger_recurring_rules` (신설), `ledgers`, `ledger_members`, `transactions` | 고정수입·정기지출 규칙 테이블 신설, 게스트 멤버 수용 대리키 PK(`ledger_member_id`) 전환, 북커버 테마·통화·지출자/소비자·청구할인·크로스링크 컬럼 보완 |
| **모아머니** (`SCR-MON-01`) | `moa_allowances`, `moa_loans` | 지급 시 부모 확정 출금 가계부(`payout_ledger_id`), 카테고리, 용돈차감(`deduct_allowance_yn`), 분납·현물 상환 이력(`repay_history_json`) 보완 |
| **모아당번·루틴** (`SCR-DUT-01`, `ROU`) | `moa_duties`, `routine_attachments` | `settlement_cycle_code`, `participants_json` 보완 및 RLS 격리용 `routine_attachments.owner_user_id` 보완 |

---

## 3. PostgreSQL 16 DDL (`init_schema.sql`) 핵심 구성

1. **스키마 · 확장 · 함수 · 트리거**:
   - `aiagent` 전용 스키마, `pgcrypto` & `vector` (`pgvector`) 확장 선언.
   - 순수 PL/pgSQL RFC 9562 `aiagent.uuid_generate_v7()` 구현 및 51개 업무 테이블 대상 `BEFORE UPDATE` `fn_audit_update_stamp()` 일괄 트리거 바인딩.
2. **53개 테이블 · 42개 인덱스 · 23개 RLS 정책**:
   - 논리 참조(`Soft Reference`) 부분 인덱스(`WHERE deleted_yn = FALSE`), `keyword_tags_json` GIN 인덱스, `embedding_vec` HNSW 코사인 인덱스, 모아부릉 3대 키 중복 대사 복합 인덱스 포함.
   - 개인 소유 23개 테이블에 `app.current_user_id` 기반 Row-Level Security 정책 자동 활성화.
3. **초기 공통코드 시드 데이터**:
   - `sys_code_groups` 26종 + `sys_code_details` 기본 코드 풀 `INSERT ... ON CONFLICT DO NOTHING` 포함.

---

## 4. 정합성 및 정적 빌드 검증 결과

- **설계서 ↔ DDL 1:1 정합성**: `01.데이터설계.md` (`53개`) == `init_schema.sql` (`53개`), 차이 `0건`, 19대 도메인 접미사 위반 `0건`.
- **인덱스 · RLS 무결성**: 인덱스 `42개` 및 RLS `23개` 대상 테이블·`owner_user_id` 컬럼 누락 `0건` *(로컬 `psql`/`docker` 미설치 환경으로 정적 파싱 전수 검증 수행)*.
- **TypeScript & Vite 빌드**: `npx.cmd tsc --noEmit` 및 `npm.cmd run build` (`vite v6.4.4`, `✓ built in 14.64s`) 0-Error 통과.
