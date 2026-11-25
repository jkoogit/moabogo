-- =============================================================================
-- 모아보고 (MoaBogo) - PostgreSQL 16 통합 마이그레이션 DDL 및 초기 시드
-- 문서 ID: 040004 (docs/04.데이터/init_schema.sql)
-- 기준 설계: docs/04.데이터/00.데이터표준정의서.md (v1.0)
--           docs/04.데이터/01.데이터설계.md (v3.2 — 53개 정규 테이블)
--           docs/04.데이터/02-화면_DB_1대1_대사검증서.md (21개 화면 1:1 검증)
-- 대상 인프라: Ubuntu 단일 노드 Docker (pgvector/pgvector:pg16, 스키마: aiagent)
-- 작성일: 2026-11-25 (세션 [0050-02])
-- =============================================================================

-- 0. 스키마 및 필수 확장 모듈 활성화
CREATE SCHEMA IF NOT EXISTS aiagent;
SET search_path TO aiagent, public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- 0.1 시간순 정렬 가능 UUID v7 생성 함수 (RFC 9562)
CREATE OR REPLACE FUNCTION aiagent.uuid_generate_v7()
RETURNS UUID AS $$
DECLARE
    unix_ts_ms BYTEA;
    uuid_bytes BYTEA;
BEGIN
    unix_ts_ms := substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::BIGINT) FROM 3);
    uuid_bytes := unix_ts_ms || gen_random_bytes(10);
    uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
    uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);
    RETURN encode(uuid_bytes, 'hex')::UUID;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 0.2 7대 감사 컬럼 자동 현행화 트리거 함수 (수정 시 updated_at & version+1 강제)
CREATE OR REPLACE FUNCTION aiagent.fn_audit_update_stamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    IF NEW.version = OLD.version THEN
        NEW.version := OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- [Group A] 시스템 공통 · 파일 · OCR · AI · 보안감사 (10개 테이블)
-- =============================================================================

-- 1. 통합 공통코드 그룹 마스터
CREATE TABLE IF NOT EXISTS aiagent.sys_code_groups (
    group_code              VARCHAR(40)  PRIMARY KEY,
    group_name              VARCHAR(120) NOT NULL,
    domain_scope_code       VARCHAR(40)  NOT NULL DEFAULT 'COMMON',
    description_text        TEXT,
    is_system_readonly_yn   BOOLEAN      NOT NULL DEFAULT FALSE,
    use_yn                  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 2. 통합 공통코드 상세 (강한 종속 CASCADE FK 예외)
CREATE TABLE IF NOT EXISTS aiagent.sys_code_details (
    detail_code_id          UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    group_code              VARCHAR(40)  NOT NULL REFERENCES aiagent.sys_code_groups(group_code) ON DELETE CASCADE,
    detail_code             VARCHAR(40)  NOT NULL,
    detail_name             VARCHAR(120) NOT NULL,
    en_name                 VARCHAR(120),
    sort_order_count        INT          NOT NULL DEFAULT 1,
    priority_count          INT          NOT NULL DEFAULT 50,
    is_default_yn           BOOLEAN      NOT NULL DEFAULT FALSE,
    use_yn                  BOOLEAN      NOT NULL DEFAULT TRUE,
    meta_json               JSONB        NOT NULL DEFAULT '{}',
    user_attr_1_text        TEXT,
    user_attr_2_text        TEXT,
    user_attr_3_text        TEXT,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT uq_sys_code_details_group_code UNIQUE (group_code, detail_code)
);

-- 3. 시스템 운영관리 거버넌스 통합 SSOT
CREATE TABLE IF NOT EXISTS aiagent.system_governance_configs (
    config_id               UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    config_key_code         VARCHAR(40)  NOT NULL UNIQUE,
    config_category_code    VARCHAR(40)  NOT NULL,
    config_payload_json     JSONB        NOT NULL DEFAULT '{}',
    description_text        TEXT,
    use_yn                  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 4. 2-Tier 공용 물리 파일 원장
CREATE TABLE IF NOT EXISTS aiagent.storage_file_objects (
    file_id                 UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    sha256_hash             VARCHAR(128) NOT NULL,
    origin_file_name        VARCHAR(120) NOT NULL,
    mime_type_code          VARCHAR(40)  NOT NULL,
    file_size_bytes_count   INT          NOT NULL DEFAULT 0,
    storage_tier_code       VARCHAR(40)  NOT NULL DEFAULT 'ACTIVE',
    object_path_url         VARCHAR(500),
    thumbnail_path_url      VARCHAR(500),
    archive_tar_path_url    VARCHAR(500),
    retention_until_at      TIMESTAMPTZ,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 5. 스토리지 및 미아데이터 수명주기 정책
CREATE TABLE IF NOT EXISTS aiagent.retention_policies (
    policy_id               UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL UNIQUE,
    orphan_ttl_days_count   INT          NOT NULL DEFAULT 90,
    archive_tier_days_count INT          NOT NULL DEFAULT 30,
    auto_purge_orphan_yn    BOOLEAN      NOT NULL DEFAULT TRUE,
    stream_cache_policy_code VARCHAR(40) NOT NULL DEFAULT 'INSTANT',
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 6. OCR 비동기 처리 큐 및 소스 관리
CREATE TABLE IF NOT EXISTS aiagent.ocr_tasks (
    task_id                     UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id               UUID         NOT NULL,
    source_file_id              UUID,
    source_image_hash           VARCHAR(128) NOT NULL,
    target_domain_code          VARCHAR(40)  NOT NULL DEFAULT 'LEDGER',
    engine_type_code            VARCHAR(40)  NOT NULL DEFAULT 'EASYOCR_LOCAL',
    status_code                 VARCHAR(40)  NOT NULL DEFAULT 'PENDING',
    purge_source_after_ocr_yn   BOOLEAN      NOT NULL DEFAULT FALSE,
    processing_ms_count         INT          NOT NULL DEFAULT 0,
    retry_count                 INT          NOT NULL DEFAULT 0,
    error_message_text          TEXT,
    created_sys                 VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by                  VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys                 VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by                  VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                     INT          NOT NULL DEFAULT 1,
    deleted_yn                  BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at                  TIMESTAMPTZ
);

-- 7. OCR 추출 텍스트 · 라인 토큰 · 대화형 매핑 이력 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.ocr_extraction_results (
    result_id               UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    task_id                 UUID         NOT NULL REFERENCES aiagent.ocr_tasks(task_id) ON DELETE CASCADE,
    owner_user_id           UUID         NOT NULL,
    redacted_raw_text       TEXT,
    raw_lines_json          JSONB        NOT NULL DEFAULT '[]',
    detected_snippets_json  JSONB        NOT NULL DEFAULT '[]',
    user_mapped_json        JSONB        NOT NULL DEFAULT '{}',
    review_state_json       JSONB        NOT NULL DEFAULT '{}',
    linked_entity_code      VARCHAR(40),
    linked_entity_id        UUID,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 8. pgvector 시맨틱 검색 임베딩 원장
CREATE TABLE IF NOT EXISTS aiagent.ai_semantic_embeddings (
    embedding_id            UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    source_domain_code      VARCHAR(40)  NOT NULL,
    source_id               UUID         NOT NULL,
    chunk_index_count       INT          NOT NULL DEFAULT 0,
    content_hash            VARCHAR(128) NOT NULL,
    content_summary_text    TEXT         NOT NULL,
    model_name              VARCHAR(120) NOT NULL DEFAULT 'text-embedding-004',
    embedding_vec           VECTOR(768)  NOT NULL,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 9. 중요 업무데이터 변경이력 감사 로그 (영구 불변)
CREATE TABLE IF NOT EXISTS aiagent.sys_audit_change_logs (
    audit_log_id            UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    target_domain_code      VARCHAR(40)  NOT NULL,
    target_table_name       VARCHAR(120) NOT NULL,
    target_record_id        UUID         NOT NULL,
    action_type_code        VARCHAR(40)  NOT NULL,
    record_version_count    INT          NOT NULL DEFAULT 1,
    changed_fields_json     JSONB        NOT NULL DEFAULT '[]',
    before_snapshot_json    JSONB,
    after_snapshot_json     JSONB,
    change_reason_text      TEXT,
    actor_user_id           UUID,
    actor_ip_hash           VARCHAR(128),
    trace_id                UUID,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1
);

-- 10. 개인정보(PII) 마스킹 해제 및 열람 감사 로그 (영구 불변)
CREATE TABLE IF NOT EXISTS aiagent.sys_pii_access_logs (
    pii_log_id              UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    viewer_user_id          UUID         NOT NULL,
    target_user_id          UUID         NOT NULL,
    target_table_name       VARCHAR(120) NOT NULL,
    target_record_id        UUID         NOT NULL,
    access_reason_code      VARCHAR(40)  NOT NULL,
    ip_hash                 VARCHAR(128),
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1
);

-- =============================================================================
-- [Group B] 회원 · 약관 · 설정 · 계좌 (6개 테이블)
-- =============================================================================

-- 11. 회원 및 인증 계정
CREATE TABLE IF NOT EXISTS aiagent.users (
    user_id                 UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    email_text              TEXT,
    password_hash           VARCHAR(128),
    nickname_name           VARCHAR(120) NOT NULL,
    avatar_url              VARCHAR(500),
    provider_code           VARCHAR(40)  NOT NULL DEFAULT 'EMAIL',
    provider_id             VARCHAR(64),
    role_code               VARCHAR(40)  NOT NULL DEFAULT 'ROLE_MEMBER',
    status_code             VARCHAR(40)  NOT NULL DEFAULT 'ACTIVE',
    email_verified_yn       BOOLEAN      NOT NULL DEFAULT FALSE,
    two_factor_enabled_yn   BOOLEAN      NOT NULL DEFAULT FALSE,
    two_factor_secret_enc   VARCHAR(512),
    personal_ocr_key_enc    VARCHAR(512),
    personal_ocr_key_masked VARCHAR(80),
    last_login_at           TIMESTAMPTZ,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 12. 회원 약관 동의 및 철회 이력 (SCR-AUT-01 대사 보완)
CREATE TABLE IF NOT EXISTS aiagent.user_term_agreements (
    agreement_id            UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    term_type_code          VARCHAR(40)  NOT NULL,
    term_version_code       VARCHAR(40)  NOT NULL,
    agreed_yn               BOOLEAN      NOT NULL DEFAULT TRUE,
    agreed_at               TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at              TIMESTAMPTZ,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 13. 사용자 코어 환경설정
CREATE TABLE IF NOT EXISTS aiagent.user_settings (
    setting_id              UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL UNIQUE,
    theme_mode_code         VARCHAR(40)  NOT NULL DEFAULT 'SYSTEM',
    quick_priority_code     VARCHAR(40)  NOT NULL DEFAULT 'TOP_ONE',
    dashboard_preset_code   VARCHAR(40)  NOT NULL DEFAULT 'DEFAULT',
    dashboard_layout_json   JSONB        NOT NULL DEFAULT '[]',
    notify_preferences_json JSONB        NOT NULL DEFAULT '{}',
    favorite_stores_json    JSONB        NOT NULL DEFAULT '[]',
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 14. 서비스별 독립 개인설정 확장 테이블
CREATE TABLE IF NOT EXISTS aiagent.user_service_preferences (
    preference_id           UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    service_code            VARCHAR(40)  NOT NULL,
    preference_json         JSONB        NOT NULL DEFAULT '{}',
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT uq_user_service_pref UNIQUE (owner_user_id, service_code)
);

-- 15. 사용자 본인 송금·결제 계좌
CREATE TABLE IF NOT EXISTS aiagent.user_accounts (
    account_id              UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    bank_code               VARCHAR(40)  NOT NULL,
    bank_name               VARCHAR(120) NOT NULL,
    account_no_enc          VARCHAR(512) NOT NULL,
    account_no_masked       VARCHAR(80)  NOT NULL,
    account_holder_name     VARCHAR(120) NOT NULL,
    alias_name              VARCHAR(120),
    is_default_yn           BOOLEAN      NOT NULL DEFAULT FALSE,
    assigned_purposes_json  JSONB        NOT NULL DEFAULT '[]',
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 16. 외부 거래처 트리 계좌
CREATE TABLE IF NOT EXISTS aiagent.external_partner_accounts (
    partner_account_id      UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    folder_code             VARCHAR(40)  NOT NULL DEFAULT 'ETC',
    partner_name            VARCHAR(120) NOT NULL,
    bank_name               VARCHAR(120),
    account_no_enc          VARCHAR(512),
    account_no_masked       VARCHAR(80),
    depositor_name          VARCHAR(120),
    is_default_yn           BOOLEAN      NOT NULL DEFAULT FALSE,
    assigned_purposes_json  JSONB        NOT NULL DEFAULT '[]',
    disabled_services_json  JSONB        NOT NULL DEFAULT '[]',
    memo_text               TEXT,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- =============================================================================
-- [Group C] 가계부 · 원자지출 · 회계 (9개 테이블)
-- =============================================================================

-- 17. 1인 다중 가계부
CREATE TABLE IF NOT EXISTS aiagent.ledgers (
    ledger_id               UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID          NOT NULL,
    ledger_name             VARCHAR(120)  NOT NULL,
    ledger_type_code        VARCHAR(40)   NOT NULL DEFAULT 'PERSONAL',
    period_type_code        VARCHAR(40)   NOT NULL DEFAULT 'LONG_TERM',
    sub_type_code           VARCHAR(40)   NOT NULL DEFAULT 'STANDARD',
    spine_design_code       VARCHAR(40)   NOT NULL DEFAULT 'INDIGO_CLASSIC',
    currency_code           VARCHAR(40)   NOT NULL DEFAULT 'KRW',
    description_text        TEXT,
    color_theme_json        JSONB         NOT NULL DEFAULT '{}',
    budget_cap_amount       DECIMAL(15,2),
    reset_cycle_code        VARCHAR(40)   NOT NULL DEFAULT 'MONTHLY',
    settlement_cycle_code   VARCHAR(40),
    closing_status_code     VARCHAR(40)   NOT NULL DEFAULT 'OPEN',
    allow_reopen_yn         BOOLEAN       NOT NULL DEFAULT TRUE,
    closed_at               TIMESTAMPTZ,
    closed_by_user_id       UUID,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 18. 가계부 멤버십 및 5단계 RBAC (게스트 수용, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.ledger_members (
    ledger_member_id        UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    ledger_id               UUID         NOT NULL REFERENCES aiagent.ledgers(ledger_id) ON DELETE CASCADE,
    user_id                 UUID,
    guest_id                VARCHAR(64),
    member_name             VARCHAR(120) NOT NULL,
    role_code               VARCHAR(40)  NOT NULL DEFAULT 'MEMBER',
    allowance_target_yn     BOOLEAN      NOT NULL DEFAULT FALSE,
    joined_at               TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 19. 가계부 고정수입 · 정기지출 규칙 (SCR-LED-01 대사 보완, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.ledger_recurring_rules (
    recurring_rule_id       UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    ledger_id               UUID          NOT NULL REFERENCES aiagent.ledgers(ledger_id) ON DELETE CASCADE,
    owner_user_id           UUID          NOT NULL,
    txn_type_code           VARCHAR(40)   NOT NULL DEFAULT 'INCOME',
    rule_name               VARCHAR(120)  NOT NULL,
    recurring_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
    day_of_month_count      INT           NOT NULL DEFAULT 25,
    category_code           VARCHAR(40)   NOT NULL,
    linked_account_id       UUID,
    notify_enabled_yn       BOOLEAN       NOT NULL DEFAULT TRUE,
    active_yn               BOOLEAN       NOT NULL DEFAULT TRUE,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 20. 통장·카드 명세서 수집 배치
CREATE TABLE IF NOT EXISTS aiagent.bank_statement_imports (
    import_id               UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    linked_account_id       UUID,
    bank_code               VARCHAR(40)  NOT NULL,
    account_no_masked       VARCHAR(80)  NOT NULL,
    collected_start_date    DATE         NOT NULL,
    collected_end_date      DATE         NOT NULL,
    unregistered_account_yn BOOLEAN      NOT NULL DEFAULT FALSE,
    raw_file_id             UUID,
    imported_count          INT          NOT NULL DEFAULT 0,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 21. 전역 원자 지출 불변 원장 SSOT
CREATE TABLE IF NOT EXISTS aiagent.atomic_expenses (
    atomic_expense_id       UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID          NOT NULL,
    import_id               UUID,
    final_amount            DECIMAL(15,2) NOT NULL,
    merchant_name           VARCHAR(120)  NOT NULL,
    standard_category_code  VARCHAR(40)   NOT NULL DEFAULT 'ETC',
    payment_method_code     VARCHAR(40)   NOT NULL DEFAULT 'CREDIT_CARD',
    source_type_code        VARCHAR(40)   NOT NULL DEFAULT 'MANUAL',
    occurred_at             TIMESTAMPTZ   NOT NULL,
    reconcile_status_code   VARCHAR(40)   NOT NULL DEFAULT 'PENDING',
    allocation_status_code  VARCHAR(40)   NOT NULL DEFAULT 'ALLOCATED',
    orphan_retention_until_at TIMESTAMPTZ,
    meta_json               JSONB         NOT NULL DEFAULT '{}',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 22. 가계부 N개 멀티 증빙 체인 (2-Tier 첨부, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.expense_proofs (
    proof_id                UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    atomic_expense_id       UUID          NOT NULL REFERENCES aiagent.atomic_expenses(atomic_expense_id) ON DELETE CASCADE,
    file_id                 UUID,
    proof_type_code         VARCHAR(40)   NOT NULL,
    reported_amount         DECIMAL(15,2) NOT NULL DEFAULT 0,
    parsed_meta_json        JSONB         NOT NULL DEFAULT '{}',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 23. 원자 지출 -> 장부 단방향 귀속·분배 항목
CREATE TABLE IF NOT EXISTS aiagent.ledger_expense_items (
    item_id                 UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    ledger_id               UUID          NOT NULL,
    atomic_expense_id       UUID          NOT NULL,
    assigned_member_id      UUID,
    allocated_amount        DECIMAL(15,2) NOT NULL,
    tag_names_json          JSONB         NOT NULL DEFAULT '[]',
    memo_text               TEXT,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 24. 입출금 및 자산이동 원장
CREATE TABLE IF NOT EXISTS aiagent.transactions (
    transaction_id          UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    ledger_id               UUID          NOT NULL,
    owner_user_id           UUID,
    atomic_expense_id       UUID,
    txn_type_code           VARCHAR(40)   NOT NULL,
    txn_amount              DECIMAL(15,2) NOT NULL,
    merchant_name           VARCHAR(120),
    category_code           VARCHAR(40),
    payment_method_code     VARCHAR(40),
    payer_name              VARCHAR(120),
    consumer_name           VARCHAR(120),
    note_text               TEXT,
    statement_discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    statement_card_name     VARCHAR(120),
    cross_service_links_json JSONB        NOT NULL DEFAULT '{}',
    tag_names_json          JSONB         NOT NULL DEFAULT '[]',
    txn_occurred_at         TIMESTAMPTZ   NOT NULL,
    asset_transfer_yn       BOOLEAN       NOT NULL DEFAULT FALSE,
    related_transfer_id     UUID,
    idempotency_hash        VARCHAR(128)  UNIQUE,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 25. 장부 일간 집계 및 체크섬 캐시 (복합 PK, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.ledger_daily_aggregations (
    ledger_id               UUID          NOT NULL REFERENCES aiagent.ledgers(ledger_id) ON DELETE CASCADE,
    aggregation_date        DATE          NOT NULL,
    total_expense_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_income_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
    txn_count               INT           NOT NULL DEFAULT 0,
    checksum_hash           VARCHAR(128)  NOT NULL,
    dirty_yn                BOOLEAN       NOT NULL DEFAULT FALSE,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ,
    PRIMARY KEY (ledger_id, aggregation_date)
);

-- =============================================================================
-- [Group D] 모아협업(당번·목표 분리) · 모아머니 · 독립이벤트/게임 (12개 테이블)
-- =============================================================================

-- 26. 모아당번 순환 과업 마스터
CREATE TABLE IF NOT EXISTS aiagent.moa_duties (
    duty_id                 UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    ledger_id               UUID         NOT NULL,
    category_code           VARCHAR(40)  NOT NULL,
    duty_title              VARCHAR(200) NOT NULL,
    duty_desc_text          TEXT,
    rotation_policy_code    VARCHAR(40)  NOT NULL DEFAULT 'RANDOM',
    settlement_cycle_code   VARCHAR(40)  NOT NULL DEFAULT 'WEEKLY',
    cycle_config_json       JSONB        NOT NULL DEFAULT '{}',
    approval_policy_code    VARCHAR(40)  NOT NULL DEFAULT 'PEER_3_APPROVAL',
    duration_type_code      VARCHAR(40)  NOT NULL DEFAULT 'INDEFINITE',
    completed_count         INT          NOT NULL DEFAULT 0,
    can_substitute_yn       BOOLEAN      NOT NULL DEFAULT TRUE,
    current_user_id         UUID,
    current_guest_id        VARCHAR(64),
    current_assignee_name   VARCHAR(120) NOT NULL,
    participants_json       JSONB        NOT NULL DEFAULT '[]',
    next_due_date           DATE,
    progress_status_code    VARCHAR(40)  NOT NULL DEFAULT 'ASSIGNED',
    settlement_status_code  VARCHAR(40)  NOT NULL DEFAULT 'UNSETTLED',
    evaluation_status_code  VARCHAR(40)  NOT NULL DEFAULT 'UNVERIFIED',
    substitute_req_json     JSONB,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 27. 모아당번 수행 인증 및 피어 승인 로그 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.moa_duty_logs (
    duty_log_id             UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    duty_id                 UUID         NOT NULL REFERENCES aiagent.moa_duties(duty_id) ON DELETE CASCADE,
    executed_user_id        UUID,
    executed_by_name        VARCHAR(120) NOT NULL,
    substitute_yn           BOOLEAN      NOT NULL DEFAULT FALSE,
    substitute_for_name     VARCHAR(120),
    memo_text               TEXT,
    submitted_at            TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluation_status_code  VARCHAR(40)  NOT NULL DEFAULT 'UNVERIFIED',
    approvals_count         INT          NOT NULL DEFAULT 0,
    approvals_required_count INT         NOT NULL DEFAULT 1,
    approved_by_json        JSONB        NOT NULL DEFAULT '[]',
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 28. 모아당번 증빙 첨부 (2-Tier, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.moa_duty_attachments (
    duty_attachment_id      UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    duty_log_id             UUID         NOT NULL REFERENCES aiagent.moa_duty_logs(duty_log_id) ON DELETE CASCADE,
    file_id                 UUID         NOT NULL,
    sort_order_count        INT          NOT NULL DEFAULT 1,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 29. 모아목표 챌린지 마스터 (당번에서 완전 분리)
CREATE TABLE IF NOT EXISTS aiagent.moa_goals (
    goal_id                 UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID          NOT NULL,
    linked_ledger_id        UUID,
    goal_title              VARCHAR(200)  NOT NULL,
    category_code           VARCHAR(40)   NOT NULL DEFAULT 'HABIT',
    status_code             VARCHAR(40)   NOT NULL DEFAULT 'IN_PROGRESS',
    start_date              DATE          NOT NULL,
    end_date                DATE          NOT NULL,
    target_value_qty        DECIMAL(12,3) NOT NULL DEFAULT 0,
    unit_name               VARCHAR(120)  NOT NULL DEFAULT '회',
    fixed_rule_text         TEXT,
    input_rule_text         TEXT,
    cheer_count             INT           NOT NULL DEFAULT 0,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 30. 모아목표 동행원 · 관람원 멤버십 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.moa_goal_members (
    goal_member_id          UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    goal_id                 UUID          NOT NULL REFERENCES aiagent.moa_goals(goal_id) ON DELETE CASCADE,
    user_id                 UUID,
    member_name             VARCHAR(120)  NOT NULL,
    goal_role_code          VARCHAR(40)   NOT NULL DEFAULT 'PARTICIPANT',
    allowance_target_yn     BOOLEAN       NOT NULL DEFAULT FALSE,
    current_value_qty       DECIMAL(12,3) NOT NULL DEFAULT 0,
    achievement_rate        DECIMAL(5,2)  NOT NULL DEFAULT 0,
    status_code             VARCHAR(40)   NOT NULL DEFAULT 'IN_PROGRESS',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 31. 모아목표 실천 인증 · 응원 · 댓글 로그 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.moa_goal_logs (
    goal_log_id             UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    goal_id                 UUID          NOT NULL REFERENCES aiagent.moa_goals(goal_id) ON DELETE CASCADE,
    goal_member_id          UUID          NOT NULL,
    executed_date           DATE          NOT NULL,
    recorded_value_qty      DECIMAL(12,3) NOT NULL DEFAULT 0,
    memo_text               TEXT,
    cheer_count             INT           NOT NULL DEFAULT 0,
    comments_json           JSONB         NOT NULL DEFAULT '[]',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 32. 모아목표 인증 첨부 (2-Tier, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.moa_goal_attachments (
    goal_attachment_id      UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    goal_log_id             UUID         NOT NULL REFERENCES aiagent.moa_goal_logs(goal_log_id) ON DELETE CASCADE,
    file_id                 UUID         NOT NULL,
    sort_order_count        INT          NOT NULL DEFAULT 1,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 33. 모아용돈 청구 및 송금
CREATE TABLE IF NOT EXISTS aiagent.moa_allowances (
    allowance_id            UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    requester_user_id       UUID          NOT NULL,
    approver_user_id        UUID,
    payout_ledger_id        UUID,
    target_account_id       UUID,
    category_code           VARCHAR(40)   NOT NULL DEFAULT 'ALLOWANCE',
    deduct_allowance_yn     BOOLEAN       NOT NULL DEFAULT TRUE,
    requested_date          DATE          NOT NULL DEFAULT CURRENT_DATE,
    request_amount          DECIMAL(15,2) NOT NULL,
    reason_text             TEXT,
    status_code             VARCHAR(40)   NOT NULL DEFAULT 'REQUESTED',
    linked_transaction_id   UUID,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 34. 모아빌림 사적 대여/차용
CREATE TABLE IF NOT EXISTS aiagent.moa_loans (
    loan_id                 UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    lender_user_id          UUID          NOT NULL,
    borrower_user_id        UUID          NOT NULL,
    linked_ledger_id        UUID,
    principal_amount        DECIMAL(15,2) NOT NULL,
    remaining_amount        DECIMAL(15,2) NOT NULL,
    due_date                DATE          NOT NULL,
    status_code             VARCHAR(40)   NOT NULL DEFAULT 'ACTIVE',
    repay_history_json      JSONB         NOT NULL DEFAULT '[]',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 35. 독립 1/N 정산 및 영구 이벤트 원장
CREATE TABLE IF NOT EXISTS aiagent.standalone_events (
    event_id                UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID,
    event_type_code         VARCHAR(40)   NOT NULL,
    event_title             VARCHAR(200)  NOT NULL,
    total_amount            DECIMAL(15,2) NOT NULL DEFAULT 0,
    binding_option_code     VARCHAR(40)   NOT NULL DEFAULT 'ASK_AFTER',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 36. 독립 이벤트 참가자 및 소멸성 게스트 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.event_participants (
    participant_id          UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    event_id                UUID          NOT NULL REFERENCES aiagent.standalone_events(event_id) ON DELETE CASCADE,
    user_id                 UUID,
    guest_id                VARCHAR(64),
    guest_name              VARCHAR(120),
    weight_count            INT           NOT NULL DEFAULT 1,
    due_amount              DECIMAL(15,2) NOT NULL DEFAULT 0,
    settled_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    mapped_yn               BOOLEAN       NOT NULL DEFAULT FALSE,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 37. 사다리·룰렛 크로스 디바이스 실시간 룸 (TTL 2시간)
CREATE TABLE IF NOT EXISTS aiagent.game_live_rooms (
    room_id                 UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    room_code               VARCHAR(40)  NOT NULL UNIQUE,
    linked_event_id         UUID,
    host_token_hash         VARCHAR(128) NOT NULL,
    game_type_code          VARCHAR(40)  NOT NULL,
    room_state_json         JSONB        NOT NULL DEFAULT '{}',
    expires_at              TIMESTAMPTZ  NOT NULL,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- =============================================================================
-- [Group E] 신규 4대 도메인: 모아데이 · 모아루틴 · 모아부릉 · 오프라인 (16개 테이블)
-- =============================================================================

-- 38. 모아데이 — 전역 통합 일정 & 반복 규칙
CREATE TABLE IF NOT EXISTS aiagent.day_schedules (
    schedule_id                 UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id               UUID          NOT NULL,
    source_type_code            VARCHAR(40)   NOT NULL DEFAULT 'PERSONAL',
    source_id                   UUID,
    item_subtype_code           VARCHAR(40)   NOT NULL DEFAULT 'GENERAL',
    schedule_title              VARCHAR(200)  NOT NULL,
    description_text            TEXT,
    start_date                  DATE          NOT NULL,
    start_time                  VARCHAR(10),
    end_date                    DATE,
    end_time                    VARCHAR(10),
    all_day_yn                  BOOLEAN       NOT NULL DEFAULT TRUE,
    status_code                 VARCHAR(40)   NOT NULL DEFAULT 'PENDING',
    related_amount              DECIMAL(15,2),
    color_code                  VARCHAR(40)   NOT NULL DEFAULT '#4F46E5',
    location_name               VARCHAR(120),
    sticker_code                VARCHAR(40),
    important_yn                BOOLEAN       NOT NULL DEFAULT FALSE,
    private_yn                  BOOLEAN       NOT NULL DEFAULT FALSE,
    recurrence_rule_json        JSONB,
    recurrence_exceptions_json  JSONB         NOT NULL DEFAULT '[]',
    parent_recurring_id         UUID,
    created_sys                 VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at                  TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by                  VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys                 VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at                  TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by                  VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                     INT           NOT NULL DEFAULT 1,
    deleted_yn                  BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at                  TIMESTAMPTZ
);

-- 39. 모아데이 — 스마트 라이프 다이어리
CREATE TABLE IF NOT EXISTS aiagent.day_diaries (
    diary_id                UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    diary_date              DATE         NOT NULL,
    diary_mode_code         VARCHAR(40)  NOT NULL DEFAULT 'STRUCTURAL',
    mood_emoji_code         VARCHAR(40),
    weather_emoji_code      VARCHAR(40),
    weather_desc_text       TEXT,
    location_name           VARCHAR(120),
    keyword_tags_json       JSONB        NOT NULL DEFAULT '[]',
    three_lines_json        JSONB        NOT NULL DEFAULT '{}',
    content_markdown_text   TEXT,
    tagged_blocks_json      JSONB        NOT NULL DEFAULT '[]',
    has_keywords_yn         BOOLEAN      NOT NULL DEFAULT TRUE,
    has_three_lines_yn      BOOLEAN      NOT NULL DEFAULT TRUE,
    has_markdown_yn         BOOLEAN      NOT NULL DEFAULT TRUE,
    private_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 40. 모아데이 — PWA 모바일 리소스 첨부 (2-Tier)
CREATE TABLE IF NOT EXISTS aiagent.day_media_attachments (
    day_media_id            UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    diary_id                UUID,
    schedule_id             UUID,
    file_id                 UUID         NOT NULL,
    media_type_code         VARCHAR(40)  NOT NULL,
    duration_sec_count      INT,
    exif_taken_at           TIMESTAMPTZ,
    exif_location_name      VARCHAR(120),
    image_ratio_code        VARCHAR(40)  NOT NULL DEFAULT 'AUTO',
    image_toggle_code       VARCHAR(40)  NOT NULL DEFAULT 'EXPANDED',
    captured_at             TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 41. 모아루틴 — 4대 라이프·금융 루틴 마스터
CREATE TABLE IF NOT EXISTS aiagent.routines (
    routine_id              UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    category_code           VARCHAR(40)  NOT NULL,
    routine_title           VARCHAR(200) NOT NULL,
    subtitle_text           TEXT,
    cycle_type_code         VARCHAR(40)  NOT NULL DEFAULT 'DAILY_MULTIPLE',
    cycle_config_json       JSONB        NOT NULL DEFAULT '{}',
    d_day_target_date       DATE,
    streak_days_count       INT          NOT NULL DEFAULT 0,
    active_yn               BOOLEAN      NOT NULL DEFAULT TRUE,
    plugin_meta_json        JSONB        NOT NULL DEFAULT '{}',
    ocr_review_map_json     JSONB        NOT NULL DEFAULT '{}',
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 42. 모아루틴 — 실천 · 복약 · OCR 인증 원장 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.routine_logs (
    routine_log_id          UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    routine_id              UUID         NOT NULL REFERENCES aiagent.routines(routine_id) ON DELETE CASCADE,
    owner_user_id           UUID         NOT NULL,
    log_date                DATE         NOT NULL,
    slot_label_code         VARCHAR(40),
    status_code             VARCHAR(40)  NOT NULL DEFAULT 'COMPLETED',
    ocr_result_id           UUID,
    log_payload_json        JSONB        NOT NULL DEFAULT '{}',
    executed_at             TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    idempotency_hash        VARCHAR(128) UNIQUE,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 43. 모아루틴 — 약복용 다중 약품 마스터 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.routine_medicine_drugs (
    drug_id                 UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    routine_id              UUID          NOT NULL REFERENCES aiagent.routines(routine_id) ON DELETE CASCADE,
    owner_user_id           UUID          NOT NULL,
    drug_name               VARCHAR(120)  NOT NULL,
    effect_category_name    VARCHAR(120),
    dose_per_take_qty       DECIMAL(12,3) NOT NULL DEFAULT 1,
    daily_frequency_count   INT           NOT NULL DEFAULT 3,
    prescribed_days_count   INT           NOT NULL DEFAULT 14,
    total_qty               DECIMAL(12,3) NOT NULL DEFAULT 0,
    remaining_qty           DECIMAL(12,3) NOT NULL DEFAULT 0,
    unit_code               VARCHAR(40)   NOT NULL DEFAULT 'TABLET',
    slot_labels_json        JSONB         NOT NULL DEFAULT '[]',
    caution_tags_json       JSONB         NOT NULL DEFAULT '[]',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 44. 모아루틴 — 알뜰폰 다인·다회선 및 차수 관리 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.routine_mvno_lines (
    mvno_line_id            UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    routine_id              UUID          NOT NULL REFERENCES aiagent.routines(routine_id) ON DELETE CASCADE,
    owner_user_id           UUID          NOT NULL,
    round_code              VARCHAR(40)   NOT NULL DEFAULT '2026-R1',
    max_line_count          INT           NOT NULL DEFAULT 5,
    line_owner_name         VARCHAR(120)  NOT NULL,
    line_alias_name         VARCHAR(120)  NOT NULL,
    phone_no_enc            VARCHAR(512),
    phone_no_masked         VARCHAR(80)   NOT NULL,
    line_mode_code          VARCHAR(40)   NOT NULL DEFAULT 'MNP_PROMO',
    round_status_code       VARCHAR(40)   NOT NULL DEFAULT 'IN_PROGRESS',
    skip_reason_text        TEXT,
    network_type_code       VARCHAR(40)   NOT NULL,
    carrier_name            VARCHAR(120)  NOT NULL,
    plan_name               VARCHAR(120)  NOT NULL,
    promo_monthly_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
    normal_monthly_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
    promo_months_count      INT           NOT NULL DEFAULT 7,
    opened_date             DATE          NOT NULL,
    mnp_restrict_end_date   DATE,
    promo_end_date          DATE          NOT NULL,
    penalty_free_date       DATE,
    contract_info_json      JSONB,
    usim_type_code          VARCHAR(40)   NOT NULL DEFAULT 'USIM',
    usim_serial_enc         VARCHAR(512),
    usim_serial_masked      VARCHAR(80),
    ocr_capture_steps_json  JSONB         NOT NULL DEFAULT '[]',
    checklist_json          JSONB         NOT NULL DEFAULT '[]',
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 45. 모아루틴 — 세금계산서 거래처별 발급 명세 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.routine_tax_clients (
    tax_client_id           UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    routine_id              UUID          NOT NULL REFERENCES aiagent.routines(routine_id) ON DELETE CASCADE,
    owner_user_id           UUID          NOT NULL,
    target_year_month_code  VARCHAR(40)   NOT NULL,
    deadline_date           DATE          NOT NULL,
    company_name            VARCHAR(120)  NOT NULL,
    biz_no_enc              VARCHAR(512),
    biz_no_masked           VARCHAR(80)   NOT NULL,
    representative_name     VARCHAR(120),
    email_text              TEXT,
    written_date            DATE,
    item_name               VARCHAR(120),
    claim_type_code         VARCHAR(40)   NOT NULL DEFAULT 'CLAIM',
    supply_amount           DECIMAL(15,2) NOT NULL DEFAULT 0,
    vat_amount              DECIMAL(15,2) NOT NULL DEFAULT 0,
    status_code             VARCHAR(40)   NOT NULL DEFAULT 'PENDING',
    issued_at               TIMESTAMPTZ,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 46. 모아루틴 — 급여·카드 일괄 정산 배치 원장 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.routine_card_settlements (
    settlement_id           UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    routine_id              UUID          NOT NULL REFERENCES aiagent.routines(routine_id) ON DELETE CASCADE,
    owner_user_id           UUID          NOT NULL,
    settlement_ym_code      VARCHAR(40)   NOT NULL,
    due_date                DATE          NOT NULL,
    source_account_id       UUID,
    source_bank_name        VARCHAR(120)  NOT NULL,
    source_account_masked   VARCHAR(80)   NOT NULL,
    card_statements_json    JSONB         NOT NULL DEFAULT '[]',
    total_amount            DECIMAL(15,2) NOT NULL DEFAULT 0,
    memo_text               TEXT,
    transferred_ledger_yn   BOOLEAN       NOT NULL DEFAULT FALSE,
    linked_transaction_id   UUID,
    idempotency_hash        VARCHAR(128)  NOT NULL UNIQUE,
    executed_at             TIMESTAMPTZ,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 47. 모아루틴 첨부 (2-Tier, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.routine_attachments (
    routine_attachment_id   UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    routine_id              UUID         NOT NULL REFERENCES aiagent.routines(routine_id) ON DELETE CASCADE,
    owner_user_id           UUID         NOT NULL,
    routine_log_id          UUID,
    file_id                 UUID         NOT NULL,
    ocr_step_code           VARCHAR(40),
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 48. 모아부릉 — 다중 차량 마스터
CREATE TABLE IF NOT EXISTS aiagent.vehicles (
    vehicle_id              UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    shared_ledger_id        UUID,
    nickname_name           VARCHAR(120) NOT NULL,
    plate_no_enc            VARCHAR(512) NOT NULL,
    plate_no_masked         VARCHAR(80)  NOT NULL,
    manufacturer_name       VARCHAR(120),
    model_name              VARCHAR(120) NOT NULL,
    model_year_count        INT,
    fuel_type_code          VARCHAR(40)  NOT NULL DEFAULT 'GASOLINE',
    current_odometer_km_count INT        NOT NULL DEFAULT 0,
    primary_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    active_yn               BOOLEAN      NOT NULL DEFAULT TRUE,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 49. 모아부릉 — 자동차 6대 통합 이력 원장 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.vehicle_logs (
    vehicle_log_id          UUID          PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    vehicle_id              UUID          NOT NULL REFERENCES aiagent.vehicles(vehicle_id) ON DELETE CASCADE,
    owner_user_id           UUID          NOT NULL,
    log_type_code           VARCHAR(40)   NOT NULL,
    occurred_at             TIMESTAMPTZ   NOT NULL,
    odometer_km_count       INT,
    txn_amount              DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_method_code     VARCHAR(40)   NOT NULL DEFAULT 'CREDIT_CARD',
    vendor_name             VARCHAR(120),
    summary_title           VARCHAR(200)  NOT NULL,
    detail_memo_text        TEXT,
    meta_json               JSONB         NOT NULL DEFAULT '{}',
    linked_expense_id       UUID,
    sync_to_day_yn          BOOLEAN       NOT NULL DEFAULT FALSE,
    linked_day_schedule_id  UUID,
    duplicate_suspected_yn  BOOLEAN       NOT NULL DEFAULT FALSE,
    linked_primary_log_id   UUID,
    idempotency_hash        VARCHAR(128)  UNIQUE,
    created_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)   NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)  NOT NULL DEFAULT 'SYSTEM',
    version                 INT           NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 50. 모아부릉 — 소모품·보험·정기점검 듀얼 주기 규칙 (CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.vehicle_maintenance_rules (
    rule_id                     UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    vehicle_id                  UUID         NOT NULL REFERENCES aiagent.vehicles(vehicle_id) ON DELETE CASCADE,
    rule_type_code              VARCHAR(40)  NOT NULL,
    rule_title                  VARCHAR(200) NOT NULL,
    interval_months_count       INT,
    interval_km_count           INT,
    last_done_date              DATE,
    last_done_odometer_km_count INT,
    next_due_date               DATE,
    next_due_odometer_km_count  INT,
    sync_to_routine_yn          BOOLEAN      NOT NULL DEFAULT TRUE,
    sync_to_day_yn              BOOLEAN      NOT NULL DEFAULT TRUE,
    active_yn                   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_sys                 VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by                  VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys                 VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by                  VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                     INT          NOT NULL DEFAULT 1,
    deleted_yn                  BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at                  TIMESTAMPTZ
);

-- 51. 모아부릉 첨부 (2-Tier, CASCADE 예외)
CREATE TABLE IF NOT EXISTS aiagent.vehicle_attachments (
    vehicle_attachment_id   UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    vehicle_log_id          UUID         NOT NULL REFERENCES aiagent.vehicle_logs(vehicle_log_id) ON DELETE CASCADE,
    file_id                 UUID         NOT NULL,
    attachment_role_code    VARCHAR(40)  NOT NULL DEFAULT 'RECEIPT',
    ocr_result_id           UUID,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 52. 오프라인 우선 동기화 대기열 원장
CREATE TABLE IF NOT EXISTS aiagent.offline_sync_queue (
    queue_id                UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    idempotency_hash        VARCHAR(128) NOT NULL UNIQUE,
    entity_type_code        VARCHAR(40)  NOT NULL,
    entity_id               UUID,
    operation_type_code     VARCHAR(40)  NOT NULL DEFAULT 'CREATE',
    summary_title           VARCHAR(200) NOT NULL,
    payload_json            JSONB        NOT NULL DEFAULT '{}',
    client_version_count    INT          NOT NULL DEFAULT 1,
    sync_status_code        VARCHAR(40)  NOT NULL DEFAULT 'PENDING',
    conflict_resolution_code VARCHAR(40),
    retry_count             INT          NOT NULL DEFAULT 0,
    queued_at               TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    synced_at               TIMESTAMPTZ,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- 53. 오프라인 IndexedDB 인증 세션 원장
CREATE TABLE IF NOT EXISTS aiagent.offline_auth_sessions (
    session_id              UUID         PRIMARY KEY DEFAULT aiagent.uuid_generate_v7(),
    owner_user_id           UUID         NOT NULL,
    provider_code           VARCHAR(40)  NOT NULL,
    token_hash              VARCHAR(128) NOT NULL UNIQUE,
    token_masked            VARCHAR(80)  NOT NULL,
    device_hash             VARCHAR(128),
    issued_at               TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at              TIMESTAMPTZ  NOT NULL,
    revoked_at              TIMESTAMPTZ,
    active_yn               BOOLEAN      NOT NULL DEFAULT TRUE,
    created_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys             VARCHAR(50)  NOT NULL DEFAULT 'WEB_APP',
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version                 INT          NOT NULL DEFAULT 1,
    deleted_yn              BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ
);

-- =============================================================================
-- 인덱스 · 부분 인덱스 · GIN · HNSW 벡터 인덱스 최적화
-- =============================================================================

-- 회원 · 약관 · 계좌
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_active_email ON aiagent.users (email_text) WHERE email_text IS NOT NULL AND deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_term_agreements_user ON aiagent.user_term_agreements (owner_user_id, term_type_code) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_accounts_owner ON aiagent.user_accounts (owner_user_id, is_default_yn) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_external_partner_owner ON aiagent.external_partner_accounts (owner_user_id, folder_code) WHERE deleted_yn = FALSE;

-- 파일 · OCR · 벡터 · 감사로그
CREATE INDEX IF NOT EXISTS idx_storage_files_owner_hash ON aiagent.storage_file_objects (owner_user_id, sha256_hash) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_storage_files_tier_retention ON aiagent.storage_file_objects (storage_tier_code, retention_until_at) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_user_status ON aiagent.ocr_tasks (owner_user_id, status_code, source_image_hash) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ocr_results_task ON aiagent.ocr_extraction_results (task_id) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_source ON aiagent.ai_semantic_embeddings (owner_user_id, source_domain_code, source_id) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_hnsw ON aiagent.ai_semantic_embeddings USING hnsw (embedding_vec vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS idx_audit_change_target ON aiagent.sys_audit_change_logs (target_table_name, target_record_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pii_access_target ON aiagent.sys_pii_access_logs (target_user_id, created_at DESC);

-- 가계부 · 원자지출 · 회계
CREATE INDEX IF NOT EXISTS idx_ledgers_owner ON aiagent.ledgers (owner_user_id, ledger_type_code) WHERE deleted_yn = FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ledger_members_user ON aiagent.ledger_members (ledger_id, user_id) WHERE user_id IS NOT NULL AND deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ledger_members_user_lookup ON aiagent.ledger_members (user_id) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ledger_recurring_ledger ON aiagent.ledger_recurring_rules (ledger_id, active_yn) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_atomic_expenses_user_time ON aiagent.atomic_expenses (owner_user_id, occurred_at DESC) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_atomic_expenses_unallocated ON aiagent.atomic_expenses (allocation_status_code, orphan_retention_until_at) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_expense_proofs_atomic ON aiagent.expense_proofs (atomic_expense_id) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ledger_expense_items_ledger ON aiagent.ledger_expense_items (ledger_id, atomic_expense_id) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_transactions_ledger_date ON aiagent.transactions (ledger_id, txn_occurred_at DESC) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_ledger_daily_agg_dirty ON aiagent.ledger_daily_aggregations (ledger_id, dirty_yn, aggregation_date) WHERE deleted_yn = FALSE;

-- 모아당번 · 모아목표 · 모아머니 · 게임
CREATE INDEX IF NOT EXISTS idx_moa_duties_ledger_states ON aiagent.moa_duties (ledger_id, progress_status_code, settlement_status_code) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_moa_goals_owner_status ON aiagent.moa_goals (owner_user_id, status_code) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_moa_allowances_requester ON aiagent.moa_allowances (requester_user_id, status_code) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_moa_loans_users ON aiagent.moa_loans (lender_user_id, borrower_user_id, status_code) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_game_live_rooms_expires ON aiagent.game_live_rooms (expires_at) WHERE deleted_yn = FALSE;

-- 모아데이 · 모아루틴 · 모아부릉 · 오프라인
CREATE INDEX IF NOT EXISTS idx_day_schedules_user_date ON aiagent.day_schedules (owner_user_id, start_date, source_type_code) WHERE deleted_yn = FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_day_diaries_user_date ON aiagent.day_diaries (owner_user_id, diary_date) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_day_diaries_tags_gin ON aiagent.day_diaries USING GIN (keyword_tags_json);
CREATE INDEX IF NOT EXISTS idx_day_media_user_captured ON aiagent.day_media_attachments (owner_user_id, media_type_code, captured_at DESC) WHERE deleted_yn = FALSE;

CREATE INDEX IF NOT EXISTS idx_routines_user_cat_active ON aiagent.routines (owner_user_id, category_code, active_yn, d_day_target_date) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_routine_logs_routine_date ON aiagent.routine_logs (routine_id, log_date DESC) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_routine_mvno_round ON aiagent.routine_mvno_lines (owner_user_id, round_code, promo_end_date) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_routine_tax_ym ON aiagent.routine_tax_clients (owner_user_id, target_year_month_code, status_code) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_routine_card_ym ON aiagent.routine_card_settlements (owner_user_id, settlement_ym_code) WHERE deleted_yn = FALSE;

CREATE INDEX IF NOT EXISTS idx_vehicles_owner_primary ON aiagent.vehicles (owner_user_id, active_yn, primary_yn) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_vehicle_date ON aiagent.vehicle_logs (vehicle_id, log_type_code, occurred_at DESC) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_dup_3key ON aiagent.vehicle_logs (owner_user_id, ((occurred_at AT TIME ZONE 'Asia/Seoul')::date), payment_method_code, txn_amount) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_vehicle_rules_due ON aiagent.vehicle_maintenance_rules (vehicle_id, active_yn, next_due_date, next_due_odometer_km_count) WHERE deleted_yn = FALSE;

CREATE INDEX IF NOT EXISTS idx_offline_queue_user_status ON aiagent.offline_sync_queue (owner_user_id, sync_status_code, queued_at) WHERE deleted_yn = FALSE;
CREATE INDEX IF NOT EXISTS idx_offline_sessions_user_active ON aiagent.offline_auth_sessions (owner_user_id, active_yn, expires_at) WHERE deleted_yn = FALSE;

-- =============================================================================
-- 51개 업무 테이블 7대 감사 컬럼 자동 갱신 트리거 일괄 바인딩
-- (영구 불변 감사 로그 sys_audit_change_logs, sys_pii_access_logs 제외)
-- =============================================================================
DO $$
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN
        SELECT tablename
          FROM pg_tables
         WHERE schemaname = 'aiagent'
           AND tablename NOT IN ('sys_audit_change_logs', 'sys_pii_access_logs')
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_audit_%I ON aiagent.%I;
             CREATE TRIGGER trg_audit_%I
             BEFORE UPDATE ON aiagent.%I
             FOR EACH ROW EXECUTE FUNCTION aiagent.fn_audit_update_stamp();',
            tbl_name, tbl_name, tbl_name, tbl_name
        );
    END LOOP;
END $$;

-- =============================================================================
-- Row-Level Security (RLS) 개인 소유 데이터 격리 정책 활성화
-- =============================================================================
DO $$
DECLARE
    rls_tbl TEXT;
BEGIN
    FOREACH rls_tbl IN ARRAY ARRAY[
        'user_term_agreements', 'user_settings', 'user_service_preferences',
        'user_accounts', 'external_partner_accounts', 'retention_policies',
        'storage_file_objects', 'ocr_tasks', 'ocr_extraction_results', 'ai_semantic_embeddings',
        'day_schedules', 'day_diaries', 'day_media_attachments',
        'routines', 'routine_logs', 'routine_medicine_drugs', 'routine_mvno_lines',
        'routine_tax_clients', 'routine_card_settlements', 'routine_attachments',
        'vehicles', 'offline_sync_queue', 'offline_auth_sessions'
    ]
    LOOP
        EXECUTE format('ALTER TABLE aiagent.%I ENABLE ROW LEVEL SECURITY;', rls_tbl);
        EXECUTE format('DROP POLICY IF EXISTS pol_owner_%I ON aiagent.%I;', rls_tbl, rls_tbl);
        EXECUTE format(
            'CREATE POLICY pol_owner_%I ON aiagent.%I
             USING (owner_user_id = NULLIF(current_setting(''app.current_user_id'', true), '''')::UUID);',
            rls_tbl, rls_tbl
        );
    END LOOP;
END $$;

-- =============================================================================
-- 통합 공통코드 초기 마스터 시드 데이터 (20대 기존 + 신규 도메인 확장)
-- =============================================================================
INSERT INTO aiagent.sys_code_groups (group_code, group_name, domain_scope_code, description_text, is_system_readonly_yn)
VALUES
    ('LEDGER_TYPE', '장부.장부유형', 'LEDGER', '개인형, 그룹공유형, 인스턴스 단기형 장부 구분', TRUE),
    ('FISCAL_PERIOD', '장부.회계기간유형', 'LEDGER', '월간, 주간, 연간, 급여일 회계 주기', TRUE),
    ('LEDGER_CHARACTER', '장부.세부성격', 'LEDGER', '가족생활비, 동아리회비, 데이트통장, 회사부서, 스터디', FALSE),
    ('SPINE_DESIGN', '장부.책등디자인', 'LEDGER', '가계부 서재 책꽂이 책등 컬러 및 텍스처 스타일', FALSE),
    ('LEDGER_STATUS', '장부.상태', 'LEDGER', '진행중(OPEN), 마감보관(CLOSED), 정산완료(SETTLED)', TRUE),
    ('LEDGER_ROLE', '장부.권한', 'LEDGER', 'OWNER, ADMIN, MEMBER, VIEWER, GUEST 5단계 권한', TRUE),
    ('BANK_CODE', '금융.은행사', 'FINANCE', '국내 주요 시중/인터넷 은행 코드', FALSE),
    ('CARD_CODE', '금융.카드사', 'FINANCE', '국내 주요 신용/체크카드 발급사 코드', FALSE),
    ('INSTALLMENT_PERIOD', '금융.할부기간', 'FINANCE', '일시불, 2~36개월 할부기간', TRUE),
    ('PAY_METHOD', '금융.결제수단', 'FINANCE', '신용카드, 체크카드, 현금, 계좌이체, 지역화폐, 간편페이', FALSE),
    ('INCOME_CHANNEL', '금융.수입채널', 'FINANCE', '근로급여, 상여금, 금융수익, 부수입, 용돈지원', FALSE),
    ('BASE_EXP_CATEGORY', '지출.기초지출카테고리', 'LEDGER', '식비, 카페, 교통, 차량/교통, 주거, 쇼핑, 문화 등', FALSE),
    ('BASE_TRANSFER_REASON', '이동.기초이동사유', 'LEDGER', '생활비 충전, 저축 납입, 대출 상환, 카드 정산', FALSE),
    ('DUTY_BASE_CATEGORY', '모아당번.기초카테고리', 'DUTY', '청소, 분리수거, 탕비실, 설거지 등 당번 업무', FALSE),
    ('DUTY_ROTATION_POLICY', '모아당번.순환정책', 'DUTY', '무작위, 이름순, 생일순, 연령가중, 순차순환', TRUE),
    ('DUTY_SETTLE_PERIOD', '모아당번.정산주기', 'DUTY', '건별즉시, 주간합산, 월간정기', TRUE),
    ('DUTY_COMPLETION_TYPE', '모아당번.완료방식', 'DUTY', '관리자승인, 동료3인승인, 자체확인, 무승인', TRUE),
    ('GOAL_INITIAL_TYPE', '모아목표.초기목표유형', 'GOAL', '습관(HABIT), 금융(FINANCE), 스터디, 독서, 저축', FALSE),
    ('GOAL_DURATION', '모아목표.실천기간', 'GOAL', '7일, 14일, 30일, 66일, 100일', FALSE),
    ('SETTLE_INITIAL_CATEGORY', '정산.초기카테고리', 'SETTLE', '식사N빵, 여행경비, 경조사, 공동구매정산', FALSE),
    ('DAY_SOURCE_TYPE', '모아데이.출처서비스', 'DAY', '가계부, 당번, 목표, 루틴, 모아부릉, 개인일정, 일기', TRUE),
    ('ROUTINE_CATEGORY', '모아루틴.4대카테고리', 'ROUTINE', '약복용, 알뜰폰환승, 세금계산서, 급여카드정산', TRUE),
    ('MVNO_NETWORK', '모아루틴.알뜰폰통신망', 'ROUTINE', 'SKT망, KT망, LGU+망', TRUE),
    ('CAR_FUEL_TYPE', '모아부릉.유종구분', 'CAR', '휘발유, 경유, 하이브리드, 전기, LPG', TRUE),
    ('CAR_LOG_TYPE', '모아부릉.6대관리포인트', 'CAR', '주유, 점검, 수리, 세차, 보험, 주차', TRUE),
    ('CAR_MAINTENANCE_TYPE', '모아부릉.소모품규칙', 'CAR', '엔진오일, 에어컨필터, 타이어위치교환, 종합검사, 보험갱신, 정기주차권', FALSE)
ON CONFLICT (group_code) DO NOTHING;

INSERT INTO aiagent.sys_code_details (group_code, detail_code, detail_name, en_name, sort_order_count, is_default_yn)
VALUES
    ('LEDGER_TYPE', 'PERSONAL', '개인 가계부', 'Personal', 1, TRUE),
    ('LEDGER_TYPE', 'GROUP', '모임 공유 가계부', 'Group Shared', 2, FALSE),
    ('LEDGER_TYPE', 'INSTANCE', '인스턴스 단기 장부', 'Instance Temporary', 3, FALSE),
    ('BANK_CODE', 'KAKAO', '카카오뱅크', 'KakaoBank', 1, TRUE),
    ('BANK_CODE', 'TOSS', '토스뱅크', 'TossBank', 2, FALSE),
    ('BANK_CODE', 'KB', 'KB국민은행', 'Kookmin Bank', 3, FALSE),
    ('BANK_CODE', 'SHINHAN', '신한은행', 'Shinhan Bank', 4, FALSE),
    ('PAY_METHOD', 'CREDIT_CARD', '신용카드', 'Credit Card', 1, TRUE),
    ('PAY_METHOD', 'CHECK_CARD', '체크카드', 'Check Card', 2, FALSE),
    ('PAY_METHOD', 'TRANSFER', '계좌이체', 'Bank Transfer', 3, FALSE),
    ('PAY_METHOD', 'CASH', '현금', 'Cash', 4, FALSE),
    ('PAY_METHOD', 'LOCAL_PAY', '지역화폐', 'Local Pay', 5, FALSE),
    ('CAR_FUEL_TYPE', 'GASOLINE', '휘발유', 'Gasoline', 1, TRUE),
    ('CAR_FUEL_TYPE', 'DIESEL', '경유', 'Diesel', 2, FALSE),
    ('CAR_FUEL_TYPE', 'HYBRID', '하이브리드', 'Hybrid', 3, FALSE),
    ('CAR_FUEL_TYPE', 'EV', '전기차', 'Electric', 4, FALSE),
    ('CAR_FUEL_TYPE', 'LPG', 'LPG', 'LPG', 5, FALSE),
    ('CAR_LOG_TYPE', 'FUEL', '주유', 'Fuel', 1, TRUE),
    ('CAR_LOG_TYPE', 'INSPECTION', '점검', 'Inspection', 2, FALSE),
    ('CAR_LOG_TYPE', 'REPAIR', '수리', 'Repair', 3, FALSE),
    ('CAR_LOG_TYPE', 'WASH', '세차', 'Car Wash', 4, FALSE),
    ('CAR_LOG_TYPE', 'INSURANCE', '보험', 'Insurance', 5, FALSE),
    ('CAR_LOG_TYPE', 'PARKING', '주차', 'Parking', 6, FALSE),
    ('ROUTINE_CATEGORY', 'HEALTH_MEDICINE', '약복용 루틴', 'Medicine Routine', 1, TRUE),
    ('ROUTINE_CATEGORY', 'LIFE_PHONE', '알뜰폰 환승', 'MVNO Transfer', 2, FALSE),
    ('ROUTINE_CATEGORY', 'BIZ_TAX', '세금계산서 발급', 'Tax Invoice', 3, FALSE),
    ('ROUTINE_CATEGORY', 'FINANCE_CARD_SETTLE', '급여·카드 정산', 'Card Settlement', 4, FALSE)
ON CONFLICT (group_code, detail_code) DO NOTHING;
